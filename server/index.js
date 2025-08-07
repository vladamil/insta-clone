const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
app.use(cors());
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

// Check if server works
app.get('/', (req, res) => {
   res.send('API is running 🎉');
});
