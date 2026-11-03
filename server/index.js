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
// Only OUR domain can make requests
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to database and start server
mongoose
   .connect(process.env.MONGO_URL)
   .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   })
   .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentRoutes);

// Check if server works
app.get('/', (req, res) => {
   res.send('API is running 🎉');
});
