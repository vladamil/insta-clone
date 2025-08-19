const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');
const requireAuth = require('../middleware/requireAuth');

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

// Follow a user route
router.post('/:username/follow', requireAuth, async (req, res) => {
   try {
      const username = req.params.username.toLowerCase().trim();
      const targetUser = await User.findOne({ username }).select('_id');

      // Check if user exists
      if (!targetUser) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Prevent self-follow
      if (targetUser._id.toString() === req.user.id) {
         return res.status(400).json({ error: 'Can not follow yourself' });
      }

      // Follow logic
      await Follow.create({ follower: req.user.id, following: targetUser._id });

      // Return updated counts
      const followersCount = await Follow.countDocuments({
         following: targetUser._id,
      });
      const followingCount = await Follow.countDocuments({
         follower: targetUser._id,
      });

      res.status(200).json({
         message: 'Followed successfully',
         followersCount,
         followingCount,
      });
   } catch (err) {
      if (err.code === 11000) {
         // Duplicate key error (if already following)
         return res.status(400).json({ error: 'Already following this user' });
      }

      res.status(500).json({ error: 'Server Error' });
   }
});
