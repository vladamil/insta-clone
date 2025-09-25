const express = require('express');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Comment = require('../models/Comment');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const storage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: 'posts',
      allowed_formats: ['jpg', 'jpeg', 'png'],
   },
});

const upload = multer({ storage });

// Create a post route
router.post('/', requireAuth, upload.single('postImage'), async (req, res) => {
   try {
      const { caption } = req.body;

      if (!req.file) {
         return res.status(400).json({ error: 'Image is required' });
      }

      //   Save Post to DB
      const post = new Post({
         author: req.user.id,
         imageUrl: req.file.path,
         imagePublicId: req.file.filename,
         caption,
      });

      await post.save();

      //   Populate post with basic user data
      const populatedPost = await Post.findById(post._id).populate(
         'author',
         'username profilePicUrl'
      );

      res.status(201).json(populatedPost);
   } catch (error) {
      console.error(error);

      // Rollback Cloudinary upload if DB save failed
      if (req.file && req.file.filename) {
         try {
            await cloudinary.uploader.destroy(req.file.filename);
         } catch (cleanupErr) {
            console.error('Failed to clean up Cloudinary image:', cleanupErr);
         }
      }

      res.status(500).json({ error: 'Failed to create post' });
   }
});

// Get a feed for logged in user (posts from users he follows)
router.get('/feed', requireAuth, async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 12;
   const skip = (page - 1) * limit;

   try {
      // Get the array of ids logged in user follows
      const followingIds = await Follow.find({
         follower: req.user.id,
      }).distinct('following');

      // Always include the logged-in user's own posts too
      followingIds.push(req.user.id);

      // Total of all feed posts
      const total = await Post.countDocuments({
         author: { $in: followingIds },
      });

      // Posts of followed users PER PAGE
      const feedPosts = await Post.find({ author: { $in: followingIds } })
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit)
         .populate('author', 'username profilePicUrl');

      // Enrich posts with like status and likes count
      const posts = feedPosts.map((post) => ({
         ...post.toObject(),
         isLiked: post.likes.some((id) => id.toString() === req.user.id),
         likesCount: post.likes.length,
      }));

      res.status(200).json({ posts, totalPages: Math.ceil(total / limit) });
   } catch (error) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch feed' });
   }
});

// Get a single post route
router.get('/:id', requireAuth, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id).populate(
         'author',
         'username profilePicUrl'
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
         (userID) => userID.toString() !== req.user.id
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
         'username profilePicUrl'
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

      const { text } = req.body;
      if (!text?.trim())
         return res.status(400).json({ error: 'Comment text required' });

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

module.exports = router;
