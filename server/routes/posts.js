const express = require('express');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
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

      // posts of followed users PER PAGE
      const feedPosts = await Post.find({ author: { $in: followingIds } })
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit)
         .populate('author', 'username profilePicUrl');

      res.status(200).json({ feedPosts, totalPages: Math.ceil(total / limit) });
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

      res.status(200).json(post);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch post' });
   }
});

module.exports = router;
