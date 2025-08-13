const express = require('express');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/User');
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
         console.error(err);
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

module.exports = router;
