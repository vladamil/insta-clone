const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');

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

      // Calculate info data
      const [followersCount, followingCount, postsCount] = await Promise.all([
         Follow.countDocuments({ following: user._id }),
         Follow.countDocuments({ follower: user._id }),
         Post.countDocuments({ author: user._id }),
      ]);

      const posts = await Post.find({ author: user._id })
         .sort({ createdAt: -1 })
         .limit(6);

      res.status(200).json({
         profilePicUrl: user.profilePicUrl || '',
         username: user.username,
         description: user.description || '',
         stats: {
            followers: followersCount,
            following: followingCount,
            posts: postsCount,
         },

         postsPrewiev: posts,
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user profile' });
   }
});

module.exports = router;
