const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
   {
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
         index: true, // faster lookups by author
      },
      imageUrl: {
         type: String,
         required: true,
      },
      imagePublicId: {
         type: String,
         required: true,
      },
      caption: {
         type: String,
      },
      comments: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
         },
      ],
      likes: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
   },
   { timestamps: true }
);

// Helpful index to sort posts by creation date quickly
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
