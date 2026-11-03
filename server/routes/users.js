import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get user profile by id
router.get('/:id', requireAuth, async (req, res) => {
   try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(404).json({ error: 'User not found' });
      }

      const user = await User.findById(req.params.id).select('-passwordHash');

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Calculate info data
      const [followersCount, followingCount, postsCount] = await Promise.all([
         Follow.countDocuments({ followingId: user._id }),
         Follow.countDocuments({ followerId: user._id }),
         Post.countDocuments({ author: user._id }),
      ]);

      // Check if target user is logged user
      const isSelf = req.user.id === user._id.toString();

      // Check if relations already exists (already following)
      const isFollow = await Follow.exists({
         followerId: req.user.id,
         followingId: user._id,
      });

      res.status(200).json({
         _id: user._id,
         profilePicUrl: user.profilePicUrl || null,
         email: user.email,
         username: user.username,
         realname: user.realname,
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
      res.status(500).json({ error: 'Failed to fetch user profile' });
   }
});

// Get user's posts separately (for easier pagination)
router.get('/:id/posts', requireAuth, async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 12;
   const skip = (page - 1) * limit;

   try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(404).json({ error: 'User not found' });
      }

      const user = await User.findById(req.params.id).select('-passwordHash');

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      const userPosts = await Post.find({ author: user._id })
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit + 1) // gets one more post over limit to see if hasMore
         .populate('author', 'username realname profilePicUrl');

      // Check if there is more
      const hasMore = userPosts.length > limit;

      // Remove that one extra post
      if (hasMore) {
         userPosts.pop();
      }

      // Enrich posts with like status and likes count
      const posts = userPosts.map((post) => ({
         ...post.toObject(),
         isLiked: post.likes.some((id) => id.toString() === req.user.id),
         likesCount: post.likes.length,
      }));

      // Enrich posts with comments count from DB
      const postIds = posts.map((p) => p._id);

      const counts = await Comment.aggregate([
         { $match: { post: { $in: postIds } } },
         { $group: { _id: '$post', count: { $sum: 1 } } },
      ]);

      const countsMap = Object.fromEntries(
         counts.map((c) => [c._id.toString(), c.count])
      );

      const enrichedPosts = posts.map((post) => ({
         ...post,
         commentsCount: countsMap[post._id.toString()] || 0,
      }));

      res.status(200).json({
         posts: enrichedPosts,
         hasMore,
      });
   } catch (err) {
      res.status(500).json({ error: 'Failed to fetch posts' });
   }
});

// Follow a user route
router.post('/:id/follow', requireAuth, async (req, res) => {
   try {
      const targetUser = await User.findById(req.params.id).select('_id');

      // Check if user exists
      if (!targetUser) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Prevent self-follow
      if (targetUser._id.toString() === req.user.id) {
         return res.status(400).json({ error: 'Can not follow yourself' });
      }

      // Follow logic
      await Follow.create({
         followerId: req.user.id,
         followingId: targetUser._id,
      });

      // Return updated counts
      const followersCount = await Follow.countDocuments({
         followingId: targetUser._id,
      });
      const followingCount = await Follow.countDocuments({
         followerId: targetUser._id,
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
router.delete('/:id/follow', requireAuth, async (req, res) => {
   try {
      const targetUser = await User.findById(req.params.id).select('_id');

      // Check if user exists
      if (!targetUser) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Unfollow logic
      const follow = await Follow.findOneAndDelete({
         followerId: req.user.id,
         followingId: targetUser._id,
      });

      // Not following safeguard
      if (!follow) {
         return res
            .status(400)
            .json({ error: "You're not following this user" });
      }

      // Return updated counts
      const followersCount = await Follow.countDocuments({
         followingId: targetUser._id,
      });
      const followingCount = await Follow.countDocuments({
         followerId: targetUser._id,
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

// Get all followers of a user
router.get('/:id/followers', requireAuth, async (req, res) => {
   try {
      const userId = req.params.id;

      // Find all follow relationships where `following` = target user
      const followers = await Follow.find({ followingId: userId })
         .populate('followerId', 'username realname profilePicUrl')
         .lean();

      // Extract the follower user objects only
      const followerUsers = followers.map((follower) => follower.followerId);

      res.json(followerUsers);
   } catch (err) {
      res.status(500).json({ error: 'Failed to fetch followers' });
   }
});

// Get all users that this user follows
router.get('/:id/followings', requireAuth, async (req, res) => {
   try {
      const userId = req.params.id;

      // Find all follow relationships where `follower` = target user
      const following = await Follow.find({ followerId: userId })
         .populate('followingId', 'username realname profilePicUrl')
         .lean();

      // ✅ Extract the following user objects only
      const followingUsers = following.map(
         (following) => following.followingId
      );

      res.json(followingUsers);
   } catch (err) {
      res.status(500).json({ error: 'Failed to fetch following users' });
   }
});

export default router;
