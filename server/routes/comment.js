import express from 'express';
import Comment from '../models/Comment.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';
import { cleanString, validateCommentText } from '../utils/validation.js';

const router = express.Router();

// Runs before every route in this file that has :id
router.param('id', (req, res, next, id) => {
   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Comment not found' });
   }
   next();
});

// REPLY TO A COMMENT
router.post('/:id/reply', requireAuth, async (req, res) => {
   const parentComment = await Comment.findById(req.params.id).populate(
      'author',
      'username',
   );
   if (!parentComment)
      return res.status(404).json({ error: 'Comment not found' });

   // Always use the top-level parent
   const topParentId = parentComment.parentComment
      ? parentComment.parentComment
      : parentComment._id;

   const text = cleanString(req.body.text);

   const textError = validateCommentText(text);
   if (textError) {
      return res.status(400).json({ error: textError });
   }

   const reply = new Comment({
      post: parentComment.post, // same post as parent
      author: req.user.id,
      text,
      parentComment: topParentId,
      replyToUsername: parentComment.author.username,
   });

   await reply.save();

   res.status(201).json(reply);
});

// EDIT A COMMENT
router.patch('/:id', requireAuth, async (req, res) => {
   const text = cleanString(req.body.text);

   const textError = validateCommentText(text);
   if (textError) {
      return res.status(400).json({ error: textError });
   }

   const comment = await Comment.findById(req.params.id);
   if (!comment) return res.status(404).json({ error: 'Comment not found' });

   // Only the author can edit comment
   if (comment.author.toString() !== req.user.id) {
      return res
         .status(403)
         .json({ error: 'Not authorized to edit this comment' });
   }

   comment.text = text;
   await comment.save();

   res.json(comment);
});

// DELETE A COMMENT (AND ITS REPLIES)
router.delete('/:id', requireAuth, async (req, res) => {
   const comment = await Comment.findById(req.params.id);
   if (!comment) return res.status(404).json({ error: 'Comment not found' });

   // Only the author can delete comment
   if (comment.author.toString() !== req.user.id) {
      return res
         .status(403)
         .json({ error: 'Not authorized to delete this comment' });
   }

   // Delete replies first
   await Comment.deleteMany({ parentComment: comment._id });

   // Delete the comment itself
   await comment.deleteOne();

   res.json({ message: 'Comment deleted successfully' });
});

export default router;
