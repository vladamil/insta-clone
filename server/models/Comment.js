const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
   {
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      post: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Post',
         required: true,
      },
      text: {
         type: String,
         required: true,
      },
      replies: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
         },
      ],
   },
   { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
