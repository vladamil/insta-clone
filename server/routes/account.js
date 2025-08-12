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

module.exports = router;
