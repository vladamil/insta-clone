import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
   {
      // No own index: the compound index below starts with followerId,
      // so it already serves "whom does this user follow?" queries
      followerId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      // Own index for "who follows this user?" (second field of the compound index)
      followingId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
         index: true,
      },
   },
   { timestamps: true },
);

// Prevent duplicate follow relationships
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export default mongoose.model('Follow', followSchema);
