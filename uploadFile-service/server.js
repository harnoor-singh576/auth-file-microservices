require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const fileRoutes = require('./routes/file');

const app = express();

// Basic logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// CORS
app.use(cors());

// Keep JSON parser for any JSON endpoints
app.use(express.json());
app.use('/', fileRoutes);

// Global error handler (handles payload-too-large, etc.)
app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large. Max 50MB' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing in .env');
  process.exit(1);
}

// Connect DB, THEN start server
mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected (file-service)');
    app.listen(PORT, () => console.log(`🚀 File Service running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
