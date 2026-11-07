import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Runs before every route in this file that has :id
router.param('id', (req, res, next, id) => {
   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'User not found' });
   }
   next();
});

// GET USER PROFILE
router.get('/:id', requireAuth, async (req, res) => {
   const user = await User.findById(req.params.id);

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

   const profile = {
      _id: user._id,
      profilePicUrl: user.profilePicUrl || null,
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
   };

   // Email is private: only the owner sees it (on the account page)
   if (isSelf) {
      profile.email = user.email;
   }

   res.status(200).json(profile);
});

// GET USER POSTS (PAGINATED)
router.get('/:id/posts', requireAuth, async (req, res) => {
   // Numbers from the URL can be anything: keep page >= 1 and limit 1–50
   const page = Math.max(parseInt(req.query.page) || 1, 1);
   const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
   const skip = (page - 1) * limit;

   // Only need to know the user exists, not load them
   const userExists = await User.exists({ _id: req.params.id });

   if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
   }

   const userPosts = await Post.find({ author: req.params.id })
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
      counts.map((c) => [c._id.toString(), c.count]),
   );

   const enrichedPosts = posts.map((post) => ({
      ...post,
      commentsCount: countsMap[post._id.toString()] || 0,
   }));

   res.status(200).json({
      posts: enrichedPosts,
      hasMore,
   });
});

// FOLLOW A USER
router.post('/:id/follow', requireAuth, async (req, res) => {
   // exists() returns { _id } or null, without loading the whole user
   const targetUser = await User.exists({ _id: req.params.id });

   if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
   }

   // The id in its standard form, from the database
   const targetId = targetUser._id;

   // Prevent self-follow
   if (targetId.toString() === req.user.id) {
      return res.status(400).json({ error: 'Can not follow yourself' });
   }

   try {
      await Follow.create({
         followerId: req.user.id,
         followingId: targetId,
      });
   } catch (err) {
      // Already following (unique index)
      if (err.code === 11000) {
         return res.status(400).json({ error: 'Already following this user' });
      }
      throw err;
   }

   // Return updated counts (both at the same time)
   const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ followingId: targetId }),
      Follow.countDocuments({ followerId: targetId }),
   ]);

   res.status(200).json({
      message: 'Followed successfully',
      followersCount,
      followingCount,
      isFollowing: true,
   });
});

// UNFOLLOW A USER
router.delete('/:id/follow', requireAuth, async (req, res) => {
   const targetUser = await User.exists({ _id: req.params.id });

   if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
   }

   const targetId = targetUser._id;

   const follow = await Follow.findOneAndDelete({
      followerId: req.user.id,
      followingId: targetId,
   });

   // Not following safeguard
   if (!follow) {
      return res.status(400).json({ error: "You're not following this user" });
   }

   // Return updated counts (both at the same time)
   const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ followingId: targetId }),
      Follow.countDocuments({ followerId: targetId }),
   ]);

   res.status(200).json({
      message: 'Unfollowed successfully',
      followersCount,
      followingCount,
      isFollowing: false,
   });
});

// GET FOLLOWERS OF A USER
router.get('/:id/followers', requireAuth, async (req, res) => {
   // Find all follow relationships where `following` = target user
   const followers = await Follow.find({ followingId: req.params.id })
      .populate('followerId', 'username realname profilePicUrl')
      .lean();

   // Extract the follower user objects only (null = deleted user, skip it)
   const followerUsers = followers
      .map((follower) => follower.followerId)
      .filter(Boolean);

   res.json(followerUsers);
});

// GET USERS THIS USER FOLLOWS
router.get('/:id/followings', requireAuth, async (req, res) => {
   // Find all follow relationships where `follower` = target user
   const following = await Follow.find({ followerId: req.params.id })
      .populate('followingId', 'username realname profilePicUrl')
      .lean();

   // Extract the following user objects only (null = deleted user, skip it)
   const followingUsers = following
      .map((following) => following.followingId)
      .filter(Boolean);

   res.json(followingUsers);
});

export default router;
