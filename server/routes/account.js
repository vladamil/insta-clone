import express from 'express';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';
import requireAuth from '../middleware/requireAuth.js';
import { sendChangeEmail } from '../utils/sendEmail.js';
import crypto from 'node:crypto';

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
   },
);

// Update username
router.patch('/username', requireAuth, async (req, res) => {
   try {
      const username = req.body.username?.trim().toLowerCase();

      if (!username) {
         return res.status(400).json({ error: 'Username is required' });
      }

      // Validate username lenght
      if (username.length < 3 || username.length > 20) {
         return res.status(400).json({
            error: 'Username must be between 3 and 20 characters',
         });
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
         { new: true },
      ).select('-passwordHash');

      res.json(user);
   } catch (err) {
      res.status(500).json({ error: 'Failed to update username' });
   }
});

// Update realname
router.patch('/realname', requireAuth, async (req, res) => {
   try {
      const realname = req.body.realname?.trim();

      if (!realname) {
         return res.status(400).json({ error: 'Name is required' });
      }

      // Validate real name lenght
      if (realname.length < 2 || realname.length > 40) {
         return res.status(400).json({
            error: 'Full name must be between 2 and 40 characters',
         });
      }

      // Validate real name regex
      const realnameRegex = /^[\p{L}][\p{L}\s'-]{1,39}$/u;

      if (!realnameRegex.test(realname)) {
         return res.status(400).json({
            error: 'Real name may contain letters, spaces and hyphens only (no numbers or symbols)',
         });
      }

      // Update in DB
      const user = await User.findByIdAndUpdate(
         req.user.id,
         { realname },
         { new: true },
      ).select('-passwordHash');

      res.json(user);
   } catch (err) {
      res.status(500).json({ error: 'Failed to update your name' });
   }
});

// Update email request
router.patch('/email', requireAuth, async (req, res) => {
   try {
      const newEmail = req.body.email?.trim().toLowerCase();

      if (!newEmail) {
         return res.status(400).json({ error: 'Email is required' });
      }

      if (newEmail.length > 50) {
         return res
            .status(400)
            .json({ error: 'Email is too long (max 50 characters)' });
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newEmail)) {
         return res.status(400).json({ error: 'Not a valid e-mail address' });
      }

      const user = await User.findById(req.user.id);

      // Prevent changing to same email
      if (user.email === newEmail) {
         return res.status(400).json({ error: 'This is already your email' });
      }

      // Check uniqueness (check both email and pendingEmail that is not expired yet)
      const existingEmail = await User.findOne({
         $or: [
            { email: newEmail },
            {
               pendingEmail: newEmail,
               emailVerificationExpires: { $gt: new Date() },
            },
         ],
      });

      if (existingEmail) {
         return res.status(400).json({ error: 'Email is already in use' });
      }

      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');

      // Hash token to store in DB
      const hashedToken = crypto
         .createHash('sha256')
         .update(token)
         .digest('hex');

      user.pendingEmail = newEmail;
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour

      await user.save();

      // Send verification email to newEmail
      await sendChangeEmail({ to: newEmail, token });

      res.json({
         message:
            'Verification link sent to new email. Please confirm to complete change.',
      });
   } catch (err) {
      res.status(500).json({ error: 'Failed to initiate email change' });
   }
});

// Verify update email
router.get('/verify-email-change', async (req, res) => {
   try {
      const { token } = req.query;

      if (!token) {
         return res.status(400).json({ error: 'Invalid token' });
      }

      const hashedToken = crypto
         .createHash('sha256')
         .update(token)
         .digest('hex');

      const user = await User.findOne({
         emailVerificationToken: hashedToken,
         emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
         return res.status(400).json({ error: 'Token is invalid or expired' });
      }

      // Finalize email change
      user.email = user.pendingEmail;
      user.pendingEmail = undefined;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      res.json({ message: 'Email updated successfully' });
   } catch (err) {
      res.status(500).json({ error: 'Failed to verify email change' });
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

      // Validate new password lenght
      if (newPassword.length > 64) {
         return res.status(400).json({
            error: 'New password is too long (max 64 characters)',
         });
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
         { new: true },
      ).select('-passwordHash');

      res.json(user);
   } catch (err) {
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

export default router;
