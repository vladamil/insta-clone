const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

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

      const newUser = new User({
         email,
         username,
         realname,
         passwordHash: hashedPassword,
      });
      await newUser.save();
      res.status(201).json({ message: 'User registered 🎉' });
   } catch (err) {
      res.status(500).json({ error: 'Server error during registration' });
   }
});

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

      // Generate JWT
      const token = jwt.sign(
         { id: user._id, username: user.username },
         process.env.JWT_SECRET,
         { expiresIn: '7d' }
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

module.exports = router;
