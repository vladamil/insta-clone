// Must be the first import: loads .env before any other module reads process.env
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import accountRoutes from './routes/account.js';
import usersRoutes from './routes/users.js';
import postsRoutes from './routes/posts.js';
import commentRoutes from './routes/comment.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow our frontend to read API responses in the browser.
// CORS is enforced by browsers only - the API itself is protected by requireAuth.
app.use(cors({ origin: process.env.CLIENT_URL }));
// Parse JSON request bodies into req.body
app.use(express.json());

// Express 5 leaves req.body undefined when there is no body
app.use((req, res, next) => {
   if (req.body === undefined || req.body === null) {
      req.body = {};
   }
   next();
});

// Check if server works
app.get('/', (req, res) => {
   res.send('API is running 🎉');
});

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentRoutes);

// Unknown route: reply with JSON instead of Express's default HTML page
app.use((req, res) => {
   res.status(404).json({ error: 'Route not found' });
});

// Central error handler: Express sends every error from routes and middleware here.
// The 4 parameters (err first) are what make Express treat it as an error handler.
app.use((err, req, res, next) => {
   console.error(err);

   // Response already started - let Express close the connection
   if (res.headersSent) return next(err);

   // Upload problems (e.g. file too large) are the client's mistake
   if (err.name === 'MulterError') {
      return res.status(400).json({ error: err.message });
   }

   // Errors from Express itself carry a status (e.g. 400 for malformed JSON)
   const status = err.status || 500;

   res.status(status).json({
      // Show the real message for client errors only, never internal details
      error: status < 500 ? err.message : 'Something went wrong on the server',
   });
});

// Connect to database first, then start accepting requests
mongoose
   .connect(process.env.MONGO_URL)
   .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   })
   .catch((err) => {
      console.error('MongoDB connection error:', err);
      // Exit with a failure code so Render reports the start-up as failed
      process.exit(1);
   });
