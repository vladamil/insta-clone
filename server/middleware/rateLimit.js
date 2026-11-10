import { rateLimit } from 'express-rate-limit';

// Each limiter counts requests per IP. Over the limit, the route never runs
// and the client gets 429. Routes that use the same limiter share its counter.

// LOGIN
const loginLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   limit: 10, // requests per IP in that window
   message: { error: 'Too many login attempts, please try again later' },
});

// ROUTES THAT SEND EMAILS OR USE EMAIL LINKS
const emailLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   limit: 10,
   message: { error: 'Too many attempts, please try again later' },
});

export { loginLimiter, emailLimiter };
