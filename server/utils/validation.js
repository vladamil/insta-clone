// Only plain text gets through. Objects like { "$ne": null } become '',
// so they can't be used as MongoDB operators (NoSQL injection).
const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// Returns an error message, or null if the password is fine
const validatePassword = (password) => {
   if (password.length > 64) {
      return 'Password is too long (max 64 characters)';
   }
   if (!PASSWORD_RULE.test(password)) {
      return 'Password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)';
   }
   return null;
};

const USERNAME_RULE = /^[a-z0-9._]+$/;

// Expects an already lowercased username
const validateUsername = (username) => {
   if (username.length < 3 || username.length > 20) {
      return 'Username must be between 3 and 20 characters';
   }
   if (!USERNAME_RULE.test(username)) {
      return 'Username may contain only letters, numbers, dots and underscores';
   }
   return null;
};

const REALNAME_RULE = /^[\p{L}][\p{L}\s'-]{1,39}$/u;

const validateRealname = (realname) => {
   if (realname.length < 2 || realname.length > 40) {
      return 'Real name must be between 2 and 40 characters';
   }
   if (!REALNAME_RULE.test(realname)) {
      return 'Real name may contain letters, spaces and hyphens only (no numbers or symbols)';
   }
   return null;
};

const EMAIL_RULE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validateEmail = (email) => {
   if (email.length > 50) {
      return 'Email is too long (max 50 characters)';
   }
   if (!EMAIL_RULE.test(email)) {
      return 'Not a valid e-mail address';
   }
   return null;
};

// Expects text that already went through cleanString
const validateCommentText = (text) => {
   if (!text) {
      return 'Comment text required';
   }
   if (text.length > 300) {
      return 'Comment is too long (max 300 characters)';
   }
   return null;
};

export {
   cleanString,
   validatePassword,
   validateUsername,
   validateRealname,
   validateEmail,
   validateCommentText,
};
