const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
   const { email, username, password } = req.body;

   try {
      const newUser = new User({ email, username, password });
      await newUser.save();
      res.status(201).json({ message: 'User registered 🎉' });
   } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Registration failed' });
   }
});

module.exports = router;
