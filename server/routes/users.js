const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile by username
router.get('/:username', async (req, res) => {
   try {
      const username = req.params.username.toLowerCase().trim();

      // Find user (case-insensitive)
      const user = await User.findOne({ username }).select(
         '-passwordHash -email'
      );

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      //  ------------------------------------------------------------
      // TODO: Replace with real counts once Post & Follow models exist
      const postsCount = 10;
      const followersCount = 7;
      const followingCount = 5;

      res.status(200).json({
         profilePicUrl: user.profilePicUrl || '',
         username: user.username,
         description: user.description || '',
         postsCount,
         followersCount,
         followingCount,
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user profile' });
   }
});

module.exports = router;
