const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');
const requireAuth = require('../middleware/requireAuth');

// Get user profile by username
router.get('/:username', requireAuth, async (req, res) => {
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

      // Check if target user is logged user
      const isSelf = req.user.id === user._id.toString();

      // Check if relations already exists (already following)
      const isFollow = await Follow.exists({
         follower: req.user.id,
         following: user._id,
      });

      res.status(200).json({
         profilePicUrl: user.profilePicUrl || null,
         username: user.username,
         description: user.description || '',
         isFollowing: !!isFollow,
         isSelf,
         stats: {
            followers: followersCount,
            following: followingCount,
            posts: postsCount,
         },
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user profile' });
   }
});

// Get user's posts separately (for easier pagination)
router.get('/:username/posts', requireAuth, async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 12;
   const skip = (page - 1) * limit;

   try {
      const username = req.params.username.toLowerCase().trim();

      // Find user (case-insensitive)
      const user = await User.findOne({ username }).select(
         '-passwordHash -email'
      );

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      // total of user posts
      const total = await Post.countDocuments({ author: user._id });

      const posts = await Post.find({ author: user._id })
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit);

      res.status(200).json({
         posts,
         total,
         totalPages: Math.ceil(total / limit),
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch posts' });
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
         isFollowing: true,
      });
   } catch (err) {
      if (err.code === 11000) {
         // Duplicate key error (if already following)
         return res.status(400).json({ error: 'Already following this user' });
      }

      res.status(500).json({ error: 'Server Error' });
   }
});

// Unfollow a user route

router.delete('/:username/follow', requireAuth, async (req, res) => {
   try {
      const username = req.params.username.toLowerCase().trim();
      const targetUser = await User.findOne({ username }).select('_id');

      // Check if user exists
      if (!targetUser) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Unfollow logic
      const follow = await Follow.findOneAndDelete({
         follower: req.user.id,
         following: targetUser._id,
      });

      // Not following safeguard
      if (!follow) {
         return res
            .status(400)
            .json({ error: "You're not following this user" });
      }

      // Return updated counts
      const followersCount = await Follow.countDocuments({
         following: targetUser._id,
      });
      const followingCount = await Follow.countDocuments({
         follower: targetUser._id,
      });

      res.status(200).json({
         message: 'Unfollowed successfully',
         followersCount,
         followingCount,
         isFollowing: false,
      });
   } catch (error) {
      res.status(500).json({ error: 'Server Error' });
   }
});

module.exports = router;
