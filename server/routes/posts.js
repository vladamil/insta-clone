import express from 'express';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import Comment from '../models/Comment.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';
import { cleanString, validateCommentText } from '../utils/validation.js';

const router = express.Router();

// Runs before every route in this file that has :id
router.param('id', (req, res, next, id) => {
   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Post not found' });
   }
   next();
});

const storage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: 'posts',
      allowed_formats: ['jpg', 'jpeg', 'png'],
   },
});

const upload = multer({
   storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Removes an image from Cloudinary. A failure is only logged
const removeImage = (publicId) =>
   cloudinary.uploader
      .destroy(publicId)
      .catch((err) =>
         console.error('Failed to clean up Cloudinary image:', err),
      );

// CREATE A POST
router.post('/', requireAuth, upload.single('postImage'), async (req, res) => {
   if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
   }

   const caption = cleanString(req.body.caption);

   // Multer has already uploaded the image at this point
   if (caption.length > 150) {
      await removeImage(req.file.filename);
      return res.status(400).json({
         error: 'Caption is too long (max 150 characters)',
      });
   }

   const post = new Post({
      author: req.user.id,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
      caption,
   });

   try {
      await post.save();
   } catch (err) {
      await removeImage(req.file.filename);
      throw err;
   }

   // Populate post with basic user data
   const populatedPost = await Post.findById(post._id).populate(
      'author',
      'username realname profilePicUrl',
   );

   res.status(201).json(populatedPost);
});

// GET FEED (PAGINATED)
router.get('/feed', requireAuth, async (req, res) => {
   // Numbers from the URL can be anything: keep page >= 1 and limit 1–50
   const page = Math.max(parseInt(req.query.page) || 1, 1);
   const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
   const skip = (page - 1) * limit;

   // Get the array of ids logged in user follows
   const followingIds = await Follow.find({
      followerId: req.user.id,
   }).distinct('followingId');

   // Always include the logged-in user's own posts too
   followingIds.push(req.user.id);

   // Posts of followed users PER PAGE
   const feedPosts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1) // gets one more post over limit to see if hasMore
      .populate('author', 'username realname profilePicUrl');

   // Check if there is more
   const hasMore = feedPosts.length > limit;

   // Remove that one extra post
   if (hasMore) {
      feedPosts.pop();
   }

   // Enrich posts with like status and likes count
   const posts = feedPosts.map((post) => ({
      ...post.toObject(),
      isLiked: post.likes.some((id) => id.toString() === req.user.id),
      likesCount: post.likes.length,
   }));

   // Enrich posts with comments count from DB
   const postIds = posts.map((p) => p._id);

   const counts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
   ]);

   const countsMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count]),
   );

   const enrichedPosts = posts.map((post) => ({
      ...post,
      commentsCount: countsMap[post._id.toString()] || 0,
   }));

   res.status(200).json({
      posts: enrichedPosts,
      hasMore,
   });
});

// GET A SINGLE POST
router.get('/:id', requireAuth, async (req, res) => {
   const post = await Post.findById(req.params.id).populate(
      'author',
      'username realname profilePicUrl',
   );
   if (!post) {
      return res.status(404).json({ error: 'Post not found' });
   }

   // Enrich with like status
   const postObj = post.toObject();
   postObj.likesCount = post.likes.length;
   postObj.isLiked = post.likes.some((id) => id.toString() === req.user.id);

   res.status(200).json(postObj);
});

// DELETE A POST
router.delete('/:id', requireAuth, async (req, res) => {
   const post = await Post.findById(req.params.id);

   if (!post) return res.status(404).json({ error: 'Post not found' });

   // Check ownership
   if (post.author.toString() !== req.user.id) {
      return res
         .status(403)
         .json({ error: 'Not authorized to delete this post' });
   }

   // Delete comments on this post
   await Comment.deleteMany({ post: post._id });

   // Delete the post itself
   await Post.findByIdAndDelete(post._id);

   // Image last: if this fails, only an unused file is left behind
   if (post.imagePublicId) {
      await removeImage(post.imagePublicId);
   }

   res.json({ message: 'Post deleted successfully' });
});

// LIKE A POST
router.post('/:id/like', requireAuth, async (req, res) => {
   // $addToSet adds the id in one step, and only if it isn't there yet
   const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.user.id } },
      { new: true },
   );

   if (!post) return res.status(404).json({ error: 'Post not found' });

   res.json({ likesCount: post.likes.length });
});

// UNLIKE A POST
router.post('/:id/unlike', requireAuth, async (req, res) => {
   // $pull removes the id in one step
   const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user.id } },
      { new: true },
   );

   if (!post) return res.status(404).json({ error: 'Post not found' });

   res.status(200).json({ likesCount: post.likes.length });
});

// GET USERS WHO LIKED A POST
router.get('/:id/likes', requireAuth, async (req, res) => {
   const post = await Post.findById(req.params.id).populate(
      'likes',
      'username realname profilePicUrl',
   );
   if (!post) return res.status(404).json({ error: 'Post not found' });

   res.json(post.likes);
});

// CREATE A COMMENT ON A POST
router.post('/:id/comment', requireAuth, async (req, res) => {
   const post = await Post.findById(req.params.id);

   if (!post) return res.status(404).json({ error: 'Post not found' });

   const text = cleanString(req.body.text);

   const textError = validateCommentText(text);
   if (textError) {
      return res.status(400).json({ error: textError });
   }

   const comment = new Comment({ post: post.id, author: req.user.id, text });
   await comment.save();

   res.status(201).json(comment);
});

// GET COMMENTS OF A POST (WITH REPLIES)
router.get('/:id/comments', requireAuth, async (req, res) => {
   // Top-level comments only
   const parentComments = await Comment.find({
      post: req.params.id,
      parentComment: null,
   })
      .populate('author', 'username profilePicUrl')
      .sort({ createdAt: -1 });

   // Top-level comments IDs
   const parentCommentsIds = parentComments.map((comment) => comment._id);

   // All replies
   const allReplies = await Comment.find({
      parentComment: { $in: parentCommentsIds },
   })
      .populate('author', 'username profilePicUrl')
      .sort({ createdAt: 1 }); // oldest first in thread

   // Group replies by the id of their parent comment
   const repliesByParentComment = allReplies.reduce((acc, child) => {
      if (!acc[child.parentComment]) acc[child.parentComment] = [];
      acc[child.parentComment].push(child);
      return acc;
   }, {});

   // Attach replies array to parentComment object
   const comments = parentComments.map((parent) => ({
      ...parent.toObject(),
      replies: repliesByParentComment[parent.id] || [],
   }));

   const commentsCount = await Comment.countDocuments({
      post: req.params.id,
   });

   res.json({ comments, commentsCount });
});

export default router;
