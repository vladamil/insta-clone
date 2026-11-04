import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
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
         maxlength: 300,
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
   { timestamps: true },
);

// Top-level comments of a post, newest first. Its prefix { post } also serves
// comment counts per post and deleting a post's comments.
commentSchema.index({ post: 1, parentComment: 1, createdAt: -1 });

// Replies of a comment, oldest first. Also serves counting and deleting replies.
commentSchema.index({ parentComment: 1, createdAt: 1 });

export default mongoose.model('Comment', commentSchema);
