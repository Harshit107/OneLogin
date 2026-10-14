
const mongoose = require('mongoose');

const verificationLinkschema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiration
    expires: 0, // MongoDB TTL index
  },
}, {
  timestamps: true,
});

const VerificationLink = mongoose.model('Verification',verificationLinkschema);
module.exports = VerificationLink;  