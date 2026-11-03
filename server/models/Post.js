import mongoose from 'mongoose';

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
      likes: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
   },
   { timestamps: true },
);

// Helpful index to sort posts by creation date quickly
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);
