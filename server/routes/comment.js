import express from 'express';
import Comment from '../models/Comment.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Create a comment reply
router.post('/:id/reply', requireAuth, async (req, res) => {
   try {
      const parentComment = await Comment.findById(req.params.id).populate(
         'author',
         'username'
      );
      if (!parentComment)
         return res.status(404).json({ error: 'Comment not found' });

      // Always use the top-level parent
      const topParentId = parentComment.parentComment
         ? parentComment.parentComment
         : parentComment._id;

      const { text } = req.body;
      if (!text?.trim())
         return res.status(40).json({ error: 'Reply text required' });

      // Validate reply lenght
      if (text?.trim().length > 300) {
         return res.status(400).json({
            error: 'Comment is too long (max 300 characters)',
         });
      }

      const reply = new Comment({
         post: parentComment.post, // same post as parent
         author: req.user.id,
         text: text.trim(),
         parentComment: topParentId,
         replyToUsername: parentComment.author.username,
      });

      await reply.save();

      res.status(201).json(reply);
   } catch (error) {
      res.status(500).json({ error: 'Failed to add reply' });
   }
});

// Edit a comment
router.patch('/:id', requireAuth, async (req, res) => {
   try {
      const { text } = req.body;

      if (!text?.trim()) {
         return res.status(400).json({ error: 'Comment text required' });
      }

      // Validate comment lenght
      if (text?.trim().length > 300) {
         return res.status(400).json({
            error: 'Comment is too long (max 300 characters)',
         });
      }

      const comment = await Comment.findById(req.params.id);
      if (!comment) return res.status(404).json({ error: 'Comment not found' });

      // Only the author can edit comment
      if (comment.author.toString() !== req.user.id) {
         return res
            .status(403)
            .json({ error: 'Not authorized to edit this comment' });
      }

      comment.text = text.trim();
      await comment.save();

      res.json(comment);
   } catch (err) {
      res.status(500).json({ error: 'Failed to edit comment' });
   }
});

// Delete a comment (and its replies)
router.delete('/:id', requireAuth, async (req, res) => {
   try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) return res.status(404).json({ error: 'Comment not found' });

      // Only the author can delete comment
      if (comment.author.toString() !== req.user.id) {
         return res
            .status(403)
            .json({ error: 'Not authorized to delete this comment' });
      }

      // Count how many replies exist
      const repliesCount = await Comment.countDocuments({
         parentComment: comment._id,
      });

      // Delete replies first
      await Comment.deleteMany({ parentComment: comment._id });

      // Delete the comment itself
      await comment.deleteOne();

      res.json({ message: 'Comment deleted successfully' });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete comment' });
   }
});

export default router;
