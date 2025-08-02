const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
   const { email, username, password } = req.body;

   //    Empty field checks
   if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
   }

   //    Validate username (no empty spaces)
   if (/\s/.test(username)) {
      return res.status(400).json({ error: 'Username cannot contain spaces' });
   }

   //    Validate email address
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Not valid e-mail address' });
   }

   //    Validate password strenght
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
         passwordHash: hashedPassword,
      });
      await newUser.save();
      res.status(201).json({ message: 'User registered 🎉' });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during registration' });
   }
});

module.exports = router;
