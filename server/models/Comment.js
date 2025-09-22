const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
   {
      post: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Post',
         required: true,
      },
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      text: {
         type: String,
         required: true,
         trim: true,
      },
      parentComment: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Comment',
         default: null, // null = top-level comment
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
