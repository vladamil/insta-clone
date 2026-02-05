const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async ({ to, token }) => {
   const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

   await resend.emails.send({
      from: 'InstaClone <noreply@vladimir-milinic.com>',
      to,
      subject: 'Verify your email',
      html: `
      <h2>Welcome to InstaClone 👋</h2>
      <p>Please verify your email to activate your account.</p>
      <a href="${verifyUrl}" style="padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `,
   });
};

module.exports = { sendVerificationEmail };
