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

export { cleanString, validatePassword };
