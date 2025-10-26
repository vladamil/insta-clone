const express = require('express');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const storage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: 'profile_pics',
      allowed_formats: ['jpg', 'jpeg', 'png'],
   },
});

const upload = multer({ storage });

// Update and set profile picture
router.patch(
   '/profile-pic',
   requireAuth,
   upload.single('profilePic'),
   async (req, res) => {
      try {
         const user = await User.findById(req.user.id).select('-passwordHash');

         //  Delete old image from Cloudinary if it exists
         if (user.profilePicPublicId) {
            await cloudinary.uploader.destroy(user.profilePicPublicId);
         }

         //  Save new image data to DB
         user.profilePicUrl = req.file.path;
         user.profilePicPublicId = req.file.filename;
         await user.save();

         res.json(user);
      } catch (err) {
         res.status(500).json({ error: 'Image upload failed' });
      }
   }
);

// Update username
router.patch('/username', requireAuth, async (req, res) => {
   try {
      const username = req.body.username?.trim().toLowerCase();

      if (!username) {
         return res.status(400).json({ error: 'Username is required' });
      }

      // Validate username (no spaces)
      if (/\s/.test(username)) {
         return res
            .status(400)
            .json({ error: 'Username cannot contain spaces' });
      }

      // Check uniqueness
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
         return res.status(400).json({ error: 'Username is already taken' });
      }

      // Update in DB
      const user = await User.findByIdAndUpdate(
         req.user.id,
         { username },
         { new: true }
      ).select('-passwordHash');

      res.json(user);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update username' });
   }
});

// Update email address
router.patch('/email', requireAuth, async (req, res) => {
   try {
      const email = req.body.email?.trim().toLowerCase();

      if (!email) {
         return res.status(400).json({ error: 'Email is required' });
      }

      // Validate email address
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
         return res.status(400).json({ error: 'Not a valid e-mail address' });
      }

      // Check uniqueness
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
         return res.status(400).json({ error: 'Email is already in use' });
      }

      // Update in DB
      const user = await User.findByIdAndUpdate(
         req.user.id,
         { email },
         { new: true }
      ).select('-passwordHash');

      res.json(user);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update email' });
   }
});

// Update password
router.patch('/password', requireAuth, async (req, res) => {
   const { oldPassword, newPassword } = req.body;

   try {
      if (!oldPassword || !newPassword) {
         return res
            .status(400)
            .json({ error: 'Both old and new password are required' });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
         return res.status(400).json({ error: 'User not found' });
      }

      // Compare old passwords
      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
         return res.status(400).json({ error: 'Old password is incorrect' });
      }

      // Validate new password strenght
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
         return res.status(400).json({
            error: 'New password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)',
         });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);

      await user.save();
      res.json({ message: 'Password updated successfully' });
   } catch (error) {
      console.error(err);
      res.status(500).json({ error: 'Password update failed' });
   }
});

// Update description/bio
router.patch('/description', requireAuth, async (req, res) => {
   try {
      const description = req.body.description?.trim();

      if (description.length > 150) {
         return res.status(400).json({ error: 'Description too long' });
      }

      const user = await User.findByIdAndUpdate(
         req.user.id,
         { description },
         { new: true }
      ).select('-passwordHash');

      res.json(user);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update description' });
   }
});

// Delete account
router.delete('/', requireAuth, async (req, res) => {
   try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      // delete profile pic from cloudinary
      if (user.profilePicPublicId) {
         await cloudinary.uploader.destroy(user.profilePicPublicId);
      }

      // delete posts (and related images + comments)
      const posts = await Post.find({ author: userId });

      for (let post of posts) {
         // delete post image
         if (post.imagePublicId) {
            await cloudinary.uploader.destroy(post.imagePublicId);
         }
         // delete comments under the post
         await Comment.deleteMany({ post: post._id });
      }

      await Post.deleteMany({ author: userId });

      // delete comments authored by user (elsewhere)
      await Comment.deleteMany({ author: userId });

      // delete follows (both directions)
      await Follow.deleteMany({
         $or: [{ followerId: userId }, { followingId: userId }],
      });

      // remove likes from posts
      await Post.updateMany({}, { $pull: { likes: userId } });

      // delete the user
      await User.findByIdAndDelete(req.user.id);

      res.json({ message: 'Account deleted successfully' });
   } catch (err) {
      res.status(500).json({ error: 'Failed to delete account' });
   }
});

module.exports = router;
