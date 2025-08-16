require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('../auth-service/config/db')

const fileRoutes = require('./routes/files');

const app = express();

// Basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Allow cross-origin requests
app.use(cors());

// For any JSON endpoints we may add later
app.use(express.json());

// DB Connection
connectDB();

// Mount file routes
app.use('/', fileRoutes);

// Error handler to catch payload-too-large from body parser
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large. Max 50MB' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}

