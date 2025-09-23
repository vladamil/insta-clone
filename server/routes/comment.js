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

module.exports = router;
