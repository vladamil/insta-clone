import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';

const router = express.Router();

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

router.get('/discover', requireAuth, async (req, res) => {
   try {
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
         ]);
      }

      res.status(200).json(suggestions);
   } catch (err) {
      res.status(500).json({ error: 'Failed to load discover suggestions' });
   }
});

router.get('/search', async (req, res) => {
   try {
      const query = req.query.q?.trim();

      if (!query) {
         return res.status(400).json({ error: 'Search query is required' });
      }

      // Search users by username or realname (case-insensitive, partial match)
      const regex = new RegExp(query, 'i');

      const users = await User.find({
         $or: [
            { username: { $regex: regex } },
            { realname: { $regex: regex } },
         ],
      }).select('username realname profilePicUrl description');

      res.json(users);
   } catch (err) {
      res.status(500).json({ error: 'Failed to search users' });
   }
});

export default router;
