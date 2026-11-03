import mongoose from 'mongoose';

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
      replyToUsername: {
         type: String,
         default: null,
      },
   },
   { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
