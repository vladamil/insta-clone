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
         const user = await User.findById(req.user.id);

         if (!user) {
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(404).json({ error: 'User not found' });
         }

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
         // Saving failed, so the new image has no owner - remove it
         await cloudinary.uploader
            .destroy(req.file.filename)
            .catch((cleanupErr) =>
               console.error('Uploaded image not removed:', cleanupErr),
            );
         throw err;
      }
   },
);

// Update username
router.patch('/username', requireAuth, async (req, res) => {
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

   try {
      const user = await User.findByIdAndUpdate(
         req.user.id,
         { username },
         { new: true, runValidators: true },
      );

      res.json(user);
   } catch (err) {
      // Taken by someone else a moment ago (unique index)
      if (err.code === 11000) {
         return res.status(400).json({ error: 'Username is already taken' });
      }
      throw err;
   }
});

// Update realname
router.patch('/realname', requireAuth, async (req, res) => {
   const realname = cleanString(req.body.realname);

   if (!realname) {
      return res.status(400).json({ error: 'Name is required' });
   }

   const realnameError = validateRealname(realname);
   if (realnameError) {
      return res.status(400).json({ error: realnameError });
   }

   const user = await User.findByIdAndUpdate(
      req.user.id,
      { realname },
      { new: true, runValidators: true },
   );

   res.json(user);
});

// Update email request
router.patch('/email', requireAuth, async (req, res) => {
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

   if (!user) {
      return res.status(404).json({ error: 'User not found' });
   }

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

   await sendChangeEmail({ to: newEmail, token });

   res.json({
      message:
         'Verification link sent to new email. Please confirm to complete change.',
   });
});

// Verify update email
router.get('/verify-email-change', async (req, res) => {
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

   try {
      await user.save();
   } catch (err) {
      // Another account took this email in the meantime (unique index)
      if (err.code === 11000) {
         return res.status(400).json({ error: 'Email is already in use' });
      }
      throw err;
   }

   res.json({ message: 'Email updated successfully' });
});

// Update password
router.patch('/password', requireAuth, async (req, res) => {
   const oldPassword = cleanString(req.body.oldPassword);
   const newPassword = cleanString(req.body.newPassword);

   if (!oldPassword || !newPassword) {
      return res
         .status(400)
         .json({ error: 'Both old and new password are required' });
   }

   const user = await User.findById(req.user.id).select('+passwordHash');

   if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

   user.passwordHash = await bcrypt.hash(newPassword, 10);

   await user.save();
   res.json({ message: 'Password updated successfully' });
});

// Update description/bio
router.patch('/description', requireAuth, async (req, res) => {
   const description = cleanString(req.body.description);

   if (description.length > 150) {
      return res
         .status(400)
         .json({ error: 'Description is too long (max 150 characters)' });
   }

   const user = await User.findByIdAndUpdate(
      req.user.id,
      { description },
      { new: true, runValidators: true },
   );

   res.json(user);
});

// Delete account
router.delete('/', requireAuth, async (req, res) => {
   const userId = req.user.id;
   const user = await User.findById(userId);

   if (!user) {
      return res.status(404).json({ error: 'User not found' });
   }

   const posts = await Post.find({ author: userId }, 'imagePublicId');
   const postIds = posts.map((post) => post._id);

   // Only top-level comments have replies
   const commentIds = await Comment.find({
      author: userId,
      parentComment: null,
   }).distinct('_id');

   // Comments on the user's posts, by the user, and replies to the user's comments
   await Comment.deleteMany({
      $or: [
         { post: { $in: postIds } },
         { author: userId },
         { parentComment: { $in: commentIds } },
      ],
   });

   await Post.deleteMany({ author: userId });

   await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });

   await Follow.deleteMany({
      $or: [{ followerId: userId }, { followingId: userId }],
   });

   await user.deleteOne();

   // Images last: if one fails, only a file is left behind, not broken data
   const imageIds = [
      user.profilePicPublicId,
      ...posts.map((post) => post.imagePublicId),
   ].filter(Boolean);

   const results = await Promise.allSettled(
      imageIds.map((id) => cloudinary.uploader.destroy(id)),
   );

   const failed = results.filter((result) => result.status === 'rejected');
   if (failed.length > 0) {
      console.error(`${failed.length} image(s) not deleted from Cloudinary`);
   }

   res.json({ message: 'Account deleted successfully' });
});

export default router;
