const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
   {
      email: {
         type: String,
         required: true,
         unique: true,
      },
      username: {
         type: String,
         required: true,
         unique: true,
      },
      realname: {
         type: String,
         required: true,
      },
      passwordHash: {
         type: String,
         required: true,
      },
      profilePicUrl: {
         type: String,
         default: '',
      },
      profilePicPublicId: {
         type: String,
         default: '',
      },
      description: {
         type: String,
         default: '',
      },
      isVerified: {
         type: Boolean,
         default: false,
      },
      emailVerificationToken: {
         type: String,
      },

      emailVerificationExpires: {
         type: Date,
      },
      emailVerificationAttempts: [
         {
            type: Date,
         },
      ],
      passwordResetToken: {
         type: String,
      },

      passwordResetExpires: {
         type: Date,
      },
      passwordResetAttempts: [
         {
            type: Date,
         },
      ],
   },
   { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
