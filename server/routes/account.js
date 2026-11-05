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
import {
   cleanString,
   validatePassword,
   validateUsername,
   validateRealname,
   validateEmail,
} from '../utils/validation.js';
import {
   ONE_HOUR,
   MAX_ATTEMPTS,
   createToken,
   hashToken,
   recentAttempts,
} from '../utils/authHelpers.js';

const router = express.Router();

const storage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: 'profile_pics',
      allowed_formats: ['jpg', 'jpeg', 'png'],
   },
});

const upload = multer({
   storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Update and set profile picture
router.patch(
   '/profile-pic',
   requireAuth,
   upload.single('profilePic'),
   async (req, res) => {
      if (!req.file) {
         return res.status(400).json({ error: 'No image uploaded' });
      }

      try {
         const user = await User.findById(req.user.id).select('-passwordHash');
         const oldPublicId = user.profilePicPublicId;

         user.profilePicUrl = req.file.path;
         user.profilePicPublicId = req.file.filename;
         await user.save();

         // Delete the old image only after the new one is saved
         if (oldPublicId) {
            try {
               await cloudinary.uploader.destroy(oldPublicId);
            } catch (err) {
               console.error('Old profile pic not deleted:', err);
            }
         }

         res.json(user);
      } catch (err) {
         res.status(500).json({ error: 'Image upload failed' });
      }
   },
);

// Update username
router.patch('/username', requireAuth, async (req, res) => {
   try {
      const username = cleanString(req.body.username).toLowerCase();

      if (!username) {
         return res.status(400).json({ error: 'Username is required' });
      }

      const usernameError = validateUsername(username);
      if (usernameError) {
         return res.status(400).json({ error: usernameError });
      }

      // Check uniqueness
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
         const isOwn = existingUsername._id.toString() === req.user.id;
         return res.status(400).json({
            error: isOwn
               ? 'This is already your username'
               : 'Username is already taken',
         });
      }

      // Update in DB
      const user = await User.findByIdAndUpdate(
         req.user.id,
         { username },
         { new: true },
      ).select('-passwordHash');

      res.json(user);
   } catch (err) {
      // Taken by someone else a moment ago (unique index)
      if (err.code === 11000) {
         return res.status(400).json({ error: 'Username is already taken' });
      }
      res.status(500).json({ error: 'Failed to update username' });
   }
});

// Update realname
router.patch('/realname', requireAuth, async (req, res) => {
   try {
      const realname = cleanString(req.body.realname);

      if (!realname) {
         return res.status(400).json({ error: 'Name is required' });
      }

      const realnameError = validateRealname(realname);
      if (realnameError) {
         return res.status(400).json({ error: realnameError });
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
      const newEmail = cleanString(req.body.email).toLowerCase();

      if (!newEmail) {
         return res.status(400).json({ error: 'Email is required' });
      }

      const emailError = validateEmail(newEmail);
      if (emailError) {
         return res.status(400).json({ error: emailError });
      }

      const user = await User.findById(req.user.id).select(
         '+emailVerificationAttempts',
      );

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

      user.emailVerificationAttempts = recentAttempts(
         user.emailVerificationAttempts,
      );

      if (user.emailVerificationAttempts.length >= MAX_ATTEMPTS) {
         return res.status(429).json({
            error: 'Too many email change attempts. Please try again in about an hour.',
         });
      }

      const token = createToken();

      user.pendingEmail = newEmail;
      user.emailVerificationToken = hashToken(token);
      user.emailVerificationExpires = Date.now() + ONE_HOUR;
      user.emailVerificationAttempts.push(new Date());

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
      const token = cleanString(req.query.token);

      if (!token) {
         return res.status(400).json({ error: 'Invalid token' });
      }

      const user = await User.findOne({
         emailVerificationToken: hashToken(token),
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
      // Another account took this email in the meantime (unique index)
      if (err.code === 11000) {
         return res.status(400).json({ error: 'Email is already in use' });
      }
      res.status(500).json({ error: 'Failed to verify email change' });
   }
});

// Update password
router.patch('/password', requireAuth, async (req, res) => {
   const oldPassword = cleanString(req.body.oldPassword);
   const newPassword = cleanString(req.body.newPassword);

   try {
      if (!oldPassword || !newPassword) {
         return res
            .status(400)
            .json({ error: 'Both old and new password are required' });
      }

      const user = await User.findById(req.user.id).select('+passwordHash');

      if (!user) {
         return res.status(400).json({ error: 'User not found' });
      }

      // Compare old passwords
      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
         return res.status(400).json({ error: 'Old password is incorrect' });
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
         return res.status(400).json({ error: passwordError });
      }

      // Hash new password
      user.passwordHash = await bcrypt.hash(newPassword, 10);

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
