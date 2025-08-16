const express = require('express');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const path = require('path');

const auth = require('../middleware/auth');
const File = require('../models/File');

const router = express.Router();

// Validate required AWS environment variables
const { AWS_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
if (!AWS_BUCKET_NAME || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.warn('⚠️ Missing AWS credentials or bucket name in .env — uploads will fail.');
}

// AWS configuration
AWS.config.update({ region: AWS_REGION || 'us-east-1' });
const s3 = new AWS.S3();

// Helpers
const generateS3Key = (userId, originalFilename) => {
  const random = crypto.randomBytes(6).toString('hex');
  const safeName = path.basename(originalFilename).replace(/\s+/g, '_');
  return `${userId}/${Date.now()}-${random}-${safeName}`;
};

// Upload (raw, max 50MB)
router.post(
  '/upload',
  auth,
  express.raw({ limit: '50mb', type: '*/*' }),
  async (req, res) => {
    try {
      const filename = (req.query.filename || req.headers['x-filename'] || '').toString().trim();
      if (!filename) return res.status(400).json({ error: 'Missing filename. Use ?filename= or X-Filename.' });

      if (!req.body || !Buffer.isBuffer(req.body)) {
        return res.status(400).json({ error: 'No file body found. Send raw binary.' });
      }

      const size = req.body.length;
      if (size > 50 * 1024 * 1024) {
        return res.status(413).json({ error: 'File too large. Max 50MB.' });
      }

      const userId = req.user.userId || req.user.id || req.user._id;
      const s3Key = generateS3Key(userId, filename);

      const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: s3Key,
        Body: req.body,
        ContentType: req.headers['content-type'] || 'application/octet-stream',
        ACL: 'private'
      };

      s3.upload(uploadParams, async (err, data) => {
        if (err) {
          console.error('S3 upload error:', err);
          return res.status(500).json({ error: 'Failed to upload to S3' });
        }

        const fileDoc = await File.create({
          filename: path.basename(filename), 
          size,
          userId: String(userId),
          s3Key
        });

        return res.status(201).json({
          message: 'File uploaded',
          fileId: fileDoc._id,
          s3Key
        });
      });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Presigned download
router.get('/file/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id).lean();
    if (!file) return res.status(404).json({ error: 'File not found' });

    const userId = req.user.userId || req.user.id || req.user._id;
    if (String(file.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden: you do not own this file' });
    }

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: AWS_BUCKET_NAME,
      Key: file.s3Key,
      Expires: 900 // 15 minutes
    });

    return res.json({ url: signedUrl, expiresIn: 900 });
  } catch (error) {
    console.error('GET /file/:id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
