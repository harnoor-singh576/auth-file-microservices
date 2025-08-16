const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {          
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  s3Key: {
    type: String,
    required: true, 
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
