import crypto from 'node:crypto';

// Email link lifetime and resend limits
const ONE_HOUR = 1000 * 60 * 60;
const MAX_ATTEMPTS = 3;

// Random token for email links
const createToken = () => crypto.randomBytes(32).toString('hex');

// The email gets the raw token, the database only its hash
const hashToken = (token) =>
   crypto.createHash('sha256').update(token).digest('hex');

// Keep only attempts from the last hour
const recentAttempts = (attempts) =>
   attempts.filter((date) => Date.now() - date.getTime() < ONE_HOUR);

export { ONE_HOUR, MAX_ATTEMPTS, createToken, hashToken, recentAttempts };
