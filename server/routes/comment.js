const express = require('express');
const Comment = require('../models/Comment');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Create a comment reply
router.post('/:id/reply', requireAuth, async (req, res) => {
   try {
      const parentComment = await Comment.findById(req.params.id);
      if (!parentComment)
         return res.status(404).json({ error: 'Comment not found' });

      const { text } = req.body;
      if (!text?.trim())
         return res.status(40).json({ error: 'Reply text required' });

      const reply = new Comment({
         post: parentComment.post, // same post as parent
         author: req.user.id,
         text: text.trim(),
         parentComment: parentComment._id,
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

module.exports = router;
