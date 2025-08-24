const express = require('express');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Post = require('../models/Post');
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

module.exports = router;
