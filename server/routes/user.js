const express = require('express');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
   try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-passwordHash');

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.status(200).json(user);
   } catch (error) {
      res.status(500).json({ error: 'Server error' });
   }
});

module.exports = router;
