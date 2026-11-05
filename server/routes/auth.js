import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
   sendVerificationEmail,
   sendPasswordResetEmail,
} from '../utils/sendEmail.js';
import {
   cleanString,
   validatePassword,
   validateUsername,
   validateRealname,
   validateEmail,
} from '../utils/validation.js';
import {
   ONE_HOUR,
   MAX_ATTEMPTS,
   createToken,
   hashToken,
   recentAttempts,
} from '../utils/authHelpers.js';

const router = express.Router();

// REGISTER ROUTE
router.post('/register', async (req, res) => {
   const email = cleanString(req.body.email).toLowerCase();
   const username = cleanString(req.body.username).toLowerCase();
   const realname = cleanString(req.body.realname);
   const password = cleanString(req.body.password);

   if (!email || !username || !realname || !password) {
      return res.status(400).json({ error: 'All fields are required' });
   }

   const usernameError = validateUsername(username);
   if (usernameError) {
      return res.status(400).json({ error: usernameError });
   }

   const realnameError = validateRealname(realname);
   if (realnameError) {
      return res.status(400).json({ error: realnameError });
   }

   const emailError = validateEmail(email);
   if (emailError) {
      return res.status(400).json({ error: emailError });
   }

   const passwordError = validatePassword(password);
   if (passwordError) {
      return res.status(400).json({ error: passwordError });
   }

   // Validate unique email
   const existingEmail = await User.findOne({
      $or: [
         { email },
         {
            pendingEmail: email,
            emailVerificationExpires: { $gt: new Date() },
         },
      ],
   });
   if (existingEmail)
      return res.status(400).json({ error: 'Account already exists' });

   // Validate unique username
   const existingUsername = await User.findOne({ username });
   if (existingUsername)
      return res
         .status(400)
         .json({ error: 'Username is taken. Please try another' });

   const emailVerificationToken = createToken();

   const newUser = new User({
      email,
      username,
      realname,
      passwordHash: await bcrypt.hash(password, 10),
      emailVerificationToken,
      emailVerificationExpires: Date.now() + ONE_HOUR,
   });

   try {
      await newUser.save();
   } catch (err) {
      // Same email or username registered a moment ago (unique index)
      if (err.code === 11000) {
         return res
            .status(400)
            .json({ error: 'Email or username is already taken' });
      }
      throw err;
   }

   // The account is saved, so a failed email can be resent from the login page
   try {
      await sendVerificationEmail({
         to: email,
         token: emailVerificationToken,
      });
   } catch (err) {
      console.error(err);
      return res.status(201).json({
         message:
            'Account created, but we could not send the verification email. Log in to send it again.',
      });
   }

   res.status(201).json({
      message:
         'Registration successful. Please check your email to verify your account.',
   });
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
   const username = cleanString(req.body.username).toLowerCase();
   const password = cleanString(req.body.password);

   if (!username || !password) {
      return res
         .status(400)
         .json({ error: 'Username and password are required' });
   }

   const user = await User.findOne({ username }).select('+passwordHash');
   if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
   }

   const isMatch = await bcrypt.compare(password, user.passwordHash);
   if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
   }

   if (!user.isVerified) {
      return res.status(403).json({
         error: 'Please verify your email before logging in',
         code: 'EMAIL_NOT_VERIFIED',
      });
   }

   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
   });

   const { passwordHash, ...userWithoutPassword } = user.toObject();

   res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
   });
});

// VERIFY EMAIL ROUTE
router.get('/verify-email', async (req, res) => {
   const token = cleanString(req.query.token);

   if (!token) {
      return res.status(400).json({ error: 'Missing verification token' });
   }

   const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
   });

   if (!user) {
      return res.status(400).json({
         error: 'Invalid or expired verification token',
      });
   }

   user.isVerified = true;
   user.emailVerificationToken = undefined;
   user.emailVerificationExpires = undefined;

   await user.save();

   res.status(200).json({
      message: 'Email verified successfully. You can now log in.',
   });
});

// RESEND VERIFY EMAIL ROUTE
router.post('/resend-verification', async (req, res) => {
   const username = cleanString(req.body.username).toLowerCase();
   if (!username) {
      return res.status(400).json({ error: 'Username is required' });
   }

   const user = await User.findOne({ username }).select(
      '+emailVerificationAttempts',
   );

   if (!user) {
      return res.status(400).json({
         error: 'Account does not exist.',
      });
   }

   if (user.isVerified) {
      return res.status(400).json({
         error: 'Account already verified.',
      });
   }

   user.emailVerificationAttempts = recentAttempts(
      user.emailVerificationAttempts,
   );

   if (user.emailVerificationAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({
         error: 'Too many verification attempts. Please try again in about an hour.',
      });
   }

   const token = createToken();

   user.emailVerificationToken = token;
   user.emailVerificationExpires = Date.now() + ONE_HOUR;
   user.emailVerificationAttempts.push(new Date());
   await user.save();

   await sendVerificationEmail({ to: user.email, token });

   res.status(200).json({
      message: 'Verification email sent',
   });
});

// FORGOT PASSWORD ROUTE
router.post('/forgot-password', async (req, res) => {
   const emailOrUsername = cleanString(req.body.emailOrUsername).toLowerCase();
   if (!emailOrUsername) {
      return res
         .status(400)
         .json({ error: 'Please enter your email or username' });
   }

   const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
   }).select('+passwordResetAttempts');

   // Same answer either way, so nobody can test which accounts exist
   if (!user) {
      return res.status(200).json({
         message: 'If the account exists, a reset email has been sent.',
      });
   }

   user.passwordResetAttempts = recentAttempts(user.passwordResetAttempts);

   if (user.passwordResetAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({
         error: 'Too many reset attempts. Please try again in about an hour.',
      });
   }

   const rawToken = createToken();

   user.passwordResetToken = hashToken(rawToken);
   user.passwordResetExpires = Date.now() + ONE_HOUR;
   user.passwordResetAttempts.push(new Date());

   await user.save();

   await sendPasswordResetEmail({ to: user.email, token: rawToken });

   res.status(200).json({
      message: 'If the account exists, a reset email has been sent.',
   });
});

// VALIDATE PASSWORD RESET TOKEN
router.post('/validate-reset-token', async (req, res) => {
   const token = cleanString(req.body.token);

   if (!token) {
      return res.status(400).json({
         error: 'Token is required',
      });
   }

   const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() },
   });

   if (!user) {
      return res.status(400).json({
         error: 'Invalid or expired reset token',
      });
   }

   res.status(200).json({
      message: 'Token is valid',
   });
});

// RESET PASSWORD ROUTE
router.post('/reset-password', async (req, res) => {
   const token = cleanString(req.body.token);
   const password = cleanString(req.body.password);

   if (!token || !password) {
      return res.status(400).json({
         error: 'Token and password are required',
      });
   }

   const passwordError = validatePassword(password);
   if (passwordError) {
      return res.status(400).json({ error: passwordError });
   }

   const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() },
   });

   if (!user) {
      return res.status(400).json({
         error: 'Invalid or expired reset token',
      });
   }

   user.passwordHash = await bcrypt.hash(password, 10);
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;

   await user.save();

   res.status(200).json({
      message: 'Password successfully reset',
   });
});

export default router;
