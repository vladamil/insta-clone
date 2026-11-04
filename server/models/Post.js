import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
   {
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
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
         trim: true,
         maxlength: 150,
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

// Posts by author, newest first: serves the feed, profile posts and post counts
postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);
