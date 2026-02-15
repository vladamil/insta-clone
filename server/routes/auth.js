const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/sendEmail');

// Resend email constrains
const ONE_HOUR = 1000 * 60 * 60;
const MAX_ATTEMPTS = 2;

// REGISTER ROUTE
router.post('/register', async (req, res) => {
   // Sanitize data from req
   const email = req.body.email?.trim().toLowerCase();
   const username = req.body.username?.trim().toLowerCase();
   const realname = req.body.realname?.trim();
   const password = req.body.password?.trim();

   // Empty fields checks
   if (!email || !username || !realname || !password) {
      return res.status(400).json({ error: 'All fields are required' });
   }

   // Validate username lenght
   if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
         error: 'Username must be between 3 and 20 characters',
      });
   }

   // Validate username (no empty spaces)
   if (/\s/.test(username)) {
      return res.status(400).json({ error: 'Username cannot contain spaces' });
   }

   // Validate real name
   const realnameRegex = /^[\p{L}][\p{L}\s'-]{1,39}$/u;

   if (realname.length < 2 || realname.length > 40) {
      return res.status(400).json({
         error: 'Real name must be between 2 and 40 characters',
      });
   }

   if (!realnameRegex.test(realname)) {
      return res.status(400).json({
         error: 'Real name may contain letters, spaces and hyphens only (no numbers or symbols)',
      });
   }

   // Validate email lenght
   if (email.length > 50) {
      return res
         .status(400)
         .json({ error: 'Email is too long (max 50 characters)' });
   }

   // Validate email address
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Not a valid e-mail address' });
   }

   // Validate password lenght
   if (password.length > 64) {
      return res.status(400).json({
         error: 'Password is too long (max 64 characters)',
      });
   }

   // Validate password strenght
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
   if (!passwordRegex.test(password)) {
      return res.status(400).json({
         error: 'Password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)',
      });
   }

   try {
      // Validate unique email
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
         return res.status(400).json({ error: 'Account already exists' });

      // Validate unique username
      const existingUsername = await User.findOne({ username });
      if (existingUsername)
         return res
            .status(400)
            .json({ error: 'Username is taken. Please try another' });

      // Hashing password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

      const newUser = new User({
         email,
         username,
         realname,
         passwordHash: hashedPassword,
         emailVerificationToken,
         emailVerificationExpires,
      });
      await newUser.save();

      // Send verification email
      await sendVerificationEmail({
         to: email,
         token: emailVerificationToken,
      });

      res.status(201).json({
         message:
            'Registration successful. Please check your email to verify your account.',
      });
   } catch (err) {
      res.status(500).json({ error: 'Server error during registration' });
   }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
   // Sanitize data from req
   const username = req.body.username?.trim().toLowerCase();
   const password = req.body.password?.trim();

   // Empty fields checks
   if (!username || !password) {
      return res
         .status(401)
         .json({ error: 'Username and password are required' });
   }

   try {
      // Find user by email
      const user = await User.findOne({ username });
      if (!user) {
         return res.status(400).json({ error: 'Invalid username or password' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
         return res.status(400).json({ error: 'Invalid username or password' });
      }

      // Check if user verified email
      if (!user.isVerified) {
         return res.status(403).json({
            error: 'Please verify your email before logging in',
            code: 'EMAIL_NOT_VERIFIED',
         });
      }

      // Generate JWT
      const token = jwt.sign(
         { id: user._id, username: user.username },
         process.env.JWT_SECRET,
         { expiresIn: '7d' },
      );

      const { passwordHash, ...userWithoutPassword } = user.toObject();

      // Return token
      res.status(200).json({
         message: 'Login successful',
         token,
         user: userWithoutPassword,
      });
   } catch (error) {
      res.status(500).json({ error: 'Server error during login' });
   }
});

// VERIFY EMAIL ROUTE
router.get('/verify-email', async (req, res) => {
   const { token } = req.query;

   if (!token) {
      return res.status(400).json({ error: 'Missing verification token' });
   }

   try {
      const user = await User.findOne({
         emailVerificationToken: token,
         emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
         return res.status(400).json({
            error: 'Invalid or expired verification token',
         });
      }

      // Verify user
      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      res.status(200).json({
         message: 'Email verified successfully. You can now log in.',
      });
   } catch (error) {
      res.status(500).json({ error: 'Email verification failed' });
   }
});

// RESEND VERIFY EMAIL ROUTE
router.post('/resend-verification', async (req, res) => {
   const { username } = req.body;

   const user = await User.findOne({ username });

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

   // Remove old attempts (older than 1 hour)
   user.emailVerificationAttempts = user.emailVerificationAttempts.filter(
      (date) => Date.now() - new Date(date).getTime() < ONE_HOUR,
   );

   // Check how many attempts remain
   if (user.emailVerificationAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({
         error: 'Too many verification attempts. Please try again in about an hour.',
      });
   }

   // generate NEW token
   const token = crypto.randomBytes(32).toString('hex');

   user.emailVerificationToken = token;
   user.emailVerificationExpires = Date.now() + 1000 * 60 * 60; // 1h
   user.emailVerificationAttempts.push(new Date());
   await user.save();

   await sendVerificationEmail({ to: user.email, token });

   res.status(200).json({
      message: 'Verification email sent',
   });
});

// FORGOT PASSWORD ROUTE
router.post('/forgot-password', async (req, res) => {
   const { emailOrUsername } = req.body;

   const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
   });

   if (!user) {
      return res.status(200).json({
         message: 'If the account exists, a reset email has been sent.',
      });
   }

   // Remove old attempts
   user.passwordResetAttempts = user.passwordResetAttempts.filter(
      (date) => Date.now() - new Date(date).getTime() < ONE_HOUR,
   );

   if (user.passwordResetAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({
         error: 'Too many reset attempts. Please try again in about an hour.',
      });
   }

   const token = crypto.randomBytes(32).toString('hex');

   user.passwordResetToken = token;
   user.passwordResetExpires = Date.now() + 1000 * 60 * 60; // 1h
   user.passwordResetAttempts.push(new Date());

   await user.save();

   await sendPasswordResetEmail(user.email, token);

   res.status(200).json({
      message: 'If the account exists, a reset email has been sent.',
   });
});

module.exports = router;
