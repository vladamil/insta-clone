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
      passwordHash: {
         type: String,
         required: true,
      },
      isConfirmed: {
         type: Boolean,
         default: false,
      },
      profilePicUrl: {
         type: String,
         default: '',
      },
      profilePicId: {
         type: String,
         default: '',
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
