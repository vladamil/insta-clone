import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'InstaClone <noreply@vladimir-milinic.com>';

// Resend returns { error } instead of throwing, so we throw it ourselves
const send = async (email) => {
   const { error } = await resend.emails.send({ from: FROM, ...email });
   if (error) {
      throw new Error(`Email not sent: ${error.message}`);
   }
};

const sendVerificationEmail = async ({ to, token }) => {
   const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

   await send({
      to,
      subject: 'Verify your email',
      html: `
      <h2>Welcome to InstaClone 👋</h2>
      <p>Please verify your email to activate your account.</p>
      <a href="${verifyUrl}">
        ${verifyUrl}
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
   });
};

const sendChangeEmail = async ({ to, token }) => {
   const changeEmailUrl = `${process.env.CLIENT_URL}/verify-email-change?token=${token}`;

   await send({
      to,
      subject: 'Confirm your new email address',
      html: `
      <h2>Changing Email Address Request</h2>
      <p>You recently requested to change the email address associated with your account.</p>
      <p>Please confirm your new email address by clicking the button below:</p>
      <a href="${changeEmailUrl}">
       ${changeEmailUrl}
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this change, you can safely ignore this email. Your current email address will remain unchanged.</p>
    `,
   });
};

const sendPasswordResetEmail = async ({ to, token }) => {
   const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

   await send({
      to,
      subject: 'Reset Your Password',
      html: `
         <h2>Password Reset Request</h2>
         <p>You requested to reset your password.</p>
         <p>Click the link below to set a new password:</p>
         <a href="${resetUrl}">${resetUrl}</a>
         <p>This link expires in 1 hour.</p>
         <p>If you did not request this, you can ignore this email.</p>
      `,
   });
};

export { sendVerificationEmail, sendChangeEmail, sendPasswordResetEmail };
