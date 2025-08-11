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

router.get('/me', requireAuth, async (req, res) => {
   try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-passwordHash');

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.status(200).json(user);
   } catch (error) {
      res.status(500).json({ error: 'Server error' });
   }
});

router.post(
   '/upload-profile-pic',
   requireAuth,
   upload.single('profilePic'),
   async (req, res) => {
      console.log(req.file);
      try {
         const user = await User.findById(req.user.id).select('-passwordHash');

         //  Delete old image from Cloudinary if it exists
         if (user.profilePicId) {
            await cloudinary.uploader.destroy(user.profilePicId);
         }

         //  Save new image data to DB
         user.profilePicUrl = req.file.path;
         user.profilePicId = req.file.filename;
         await user.save();

         res.json(user);
      } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Image upload failed' });
      }
   }
);

module.exports = router;
