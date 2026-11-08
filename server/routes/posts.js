import express from 'express';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import Comment from '../models/Comment.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';
import { cleanString, validateCommentText } from '../utils/validation.js';

const router = express.Router();

// Runs before every route in this file that has :id
router.param('id', (req, res, next, id) => {
   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Post not found' });
   }
   next();
});

const storage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: 'posts',
      allowed_formats: ['jpg', 'jpeg', 'png'],
   },
});

const upload = multer({
   storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Removes an uploaded image that didn't end up in a post
const removeUpload = (publicId) =>
   cloudinary.uploader
      .destroy(publicId)
      .catch((err) =>
         console.error('Failed to clean up Cloudinary image:', err),
      );

// Create a post route
router.post('/', requireAuth, upload.single('postImage'), async (req, res) => {
   if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
   }

   const caption = cleanString(req.body.caption);

   // Multer has already uploaded the image at this point
   if (caption.length > 150) {
      await removeUpload(req.file.filename);
      return res.status(400).json({
         error: 'Caption is too long (max 150 characters)',
      });
   }

   const post = new Post({
      author: req.user.id,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
      caption,
   });

   try {
      await post.save();
   } catch (err) {
      await removeUpload(req.file.filename);
      throw err;
   }

   // Populate post with basic user data
   const populatedPost = await Post.findById(post._id).populate(
      'author',
      'username realname profilePicUrl',
   );

   res.status(201).json(populatedPost);
});

// Get a feed for logged in user (posts from users he follows)
router.get('/feed', requireAuth, async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 12;
   const skip = (page - 1) * limit;

   try {
      // Get the array of ids logged in user follows
      const followingIds = await Follow.find({
         followerId: req.user.id,
      }).distinct('followingId');

      // Always include the logged-in user's own posts too
      followingIds.push(req.user.id);

      // Posts of followed users PER PAGE
      const feedPosts = await Post.find({ author: { $in: followingIds } })
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit + 1) // gets one more post over limit to see if hasMore
         .populate('author', 'username realname profilePicUrl');

      // Check if there is more
      const hasMore = feedPosts.length > limit;

      // Remove that one extra post
      if (hasMore) {
         feedPosts.pop();
      }

      // Enrich posts with like status and likes count
      const posts = feedPosts.map((post) => ({
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
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch feed' });
   }
});

// Get a single post route
router.get('/:id', requireAuth, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id).populate(
         'author',
         'username realname profilePicUrl',
      );
      if (!post) {
         return res.status(404).json({ error: 'Post not found' });
      }

      // Enrich with like status
      const postObj = post.toObject();
      postObj.likesCount = post.likes.length;
      postObj.isLiked = post.likes.some((id) => id.toString() === req.user.id);

      res.status(200).json(postObj);
   } catch (err) {
      res.status(500).json({ error: 'Failed to fetch post' });
   }
});

// Delete a post
router.delete('/:id', requireAuth, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id);

      if (!post) return res.status(404).json({ error: 'Post not found' });

      // Check ownership
      if (post.author.toString() !== req.user.id) {
         return res
            .status(403)
            .json({ error: 'Not authorized to delete this post' });
      }

      // Delete image from Cloudinary
      if (post.imagePublicId) {
         await cloudinary.uploader.destroy(post.imagePublicId);
      }

      // Delete comments on this post
      await Comment.deleteMany({ post: post._id });

      // Delete the post itself
      await Post.findByIdAndDelete(post._id);

      res.json({ message: 'Post deleted successfully' });
   } catch (err) {
      res.status(500).json({ error: 'Failed to delete post' });
   }
});

// Like a post
router.post('/:id/like', requireAuth, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id);

      if (!post) return res.status(404).json({ error: 'Post not found' });

      // Prevent duplicate likes
      if (post.likes.includes(req.user.id)) {
         return res.status(400).json({ error: 'Post already liked' });
      }

      post.likes.push(req.user.id);
      await post.save();

      res.json({ likesCount: post.likes.length });
   } catch (error) {
      res.status(500).json({ error: 'Failed to like post' });
   }
});

// Unlike a post
router.post('/:id/unlike', requireAuth, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id);

      if (!post) return res.status(404).json({ error: 'Post not found' });

      post.likes = post.likes.filter(
         (userID) => userID.toString() !== req.user.id,
      );
      await post.save();

      res.status(200).json({ likesCount: post.likes.length });
   } catch (error) {
      res.status(500).json({ error: 'Failed to unlike post' });
   }
});

// List of users who liked a post
router.get('/:id/likes', requireAuth, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id).populate(
         'likes',
         'username realname profilePicUrl',
      );
      if (!post) return res.status(404).json({ error: 'Post not found' });

      res.json(post.likes);
   } catch (err) {
      res.status(500).json({ error: 'Failed to fetch likes' });
   }
});

// Create a comment on a post
router.post('/:id/comment', requireAuth, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id);

      if (!post) return res.status(404).json({ error: 'Post not found' });

      const text = cleanString(req.body.text);

      const textError = validateCommentText(text);
      if (textError) {
         return res.status(400).json({ error: textError });
      }

      const comment = new Comment({ post: post.id, author: req.user.id, text });
      await comment.save();

      res.status(201).json(comment);
   } catch (error) {
      res.status(500).json({ error: 'Failed to post a comment' });
   }
});

// Get all comments for a post (with replies)
router.get('/:id/comments', requireAuth, async (req, res) => {
   try {
      // Top-level comments only
      const parentComments = await Comment.find({
         post: req.params.id,
         parentComment: null,
      })
         .populate('author', 'username profilePicUrl')
         .sort({ createdAt: -1 });

      // Top-level comments IDs
      const parentCommentsIds = parentComments.map((comment) => comment._id);

      // All replies
      const allReplies = await Comment.find({
         parentComment: { $in: parentCommentsIds },
      })
         .populate('author', 'username profilePicUrl')
         .sort({ createdAt: 1 }); // oldest first in thread;

      // Replies by parentComment object ***
      const repliesByParentComment = allReplies.reduce((acc, child) => {
         if (!acc[child.parentComment]) acc[child.parentComment] = [];
         acc[child.parentComment].push(child);
         return acc;
      }, {});

      // Attach replies array to parentComment object
      const comments = parentComments.map((parent) => ({
         ...parent.toObject(),
         replies: repliesByParentComment[parent.id] || [],
      }));

      const commentsCount = await Comment.countDocuments({
         post: req.params.id,
      });

      res.json({ comments, commentsCount });
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
   }
});

export default router;
