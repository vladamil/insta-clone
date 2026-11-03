import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
   {
      followerId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
         index: true,
      },
      followingId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
         index: true,
      },
   },
   { timestamps: true }
);

// Prevent duplicate follow relationships
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export default mongoose.model('Follow', followSchema);
