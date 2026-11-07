import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';
import { cleanString } from '../utils/validation.js';

const router = express.Router();

// Turns regex symbols like . * ( into plain characters
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET LOGGED-IN USER
router.get('/me', requireAuth, async (req, res) => {
   const user = await User.findById(req.user.id);

   if (!user) return res.status(404).json({ error: 'User not found' });

   res.status(200).json(user);
});

// DISCOVER (SUGGESTED USERS)
router.get('/discover', requireAuth, async (req, res) => {
   const userId = req.user.id;

   // User's followings
   const following = await Follow.find({ followerId: userId }).select(
      'followingId',
   );
   const followingIds = following.map((f) => f.followingId.toString());

   // Friends of friends
   const friendsOfFriends = await Follow.find({
      followerId: { $in: followingIds },
   }).select('followingId');

   let suggestionIds = friendsOfFriends.map((f) => f.followingId.toString());

   // Exclude already followed and own id
   const excludedIds = [userId, ...followingIds];

   suggestionIds = [...new Set(suggestionIds)].filter(
      (id) => !excludedIds.includes(id),
   );

   let suggestions = [];

   if (suggestionIds.length > 0) {
      // if there are suggestions
      suggestions = await User.find({ _id: { $in: suggestionIds } })
         .select('username realname profilePicUrl')
         .limit(5);
   } else {
      // if no suggestions, give 5 random unfollowed users
      suggestions = await User.aggregate([
         {
            $match: {
               _id: {
                  $nin: excludedIds.map(
                     (id) => new mongoose.Types.ObjectId(id),
                  ),
               },
            },
         },
         { $sample: { size: 5 } },
         // Aggregate ignores select: false, so pick the public fields by hand
         { $project: { username: 1, realname: 1, profilePicUrl: 1 } },
      ]);
   }

   res.status(200).json(suggestions);
});

// SEARCH USERS
router.get('/search', requireAuth, async (req, res) => {
   const query = cleanString(req.query.q);

   if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
   }

   if (query.length > 40) {
      return res
         .status(400)
         .json({ error: 'Search is too long (max 40 characters)' });
   }

   // Search users by username or realname (case-insensitive, partial match)
   const regex = new RegExp(escapeRegex(query), 'i');

   const users = await User.find({
      $or: [{ username: { $regex: regex } }, { realname: { $regex: regex } }],
   })
      .select('username realname profilePicUrl description')
      .limit(20);

   res.json(users);
});

export default router;
