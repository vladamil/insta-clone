import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
   {
      email: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
         maxlength: 50,
      },
      username: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
         minlength: 3,
         maxlength: 20,
      },
      realname: {
         type: String,
         required: true,
         trim: true,
         minlength: 2,
         maxlength: 40,
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
         trim: true,
         maxlength: 150,
      },
      isVerified: {
         type: Boolean,
         default: false,
      },
      pendingEmail: {
         type: String,
         trim: true,
         lowercase: true,
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

export default mongoose.model('User', userSchema);
