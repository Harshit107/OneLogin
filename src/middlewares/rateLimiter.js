const rateLimit = require("express-rate-limit");

/**
 * Limiter for user login and token generation
 * Max 15 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "too_many_requests",
    message: "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * Limiter for email verification requests to prevent email bombing
 * Max 5 attempts per 15 minutes
 */
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "too_many_requests",
    message: "Too many email requests, please try again after 15 minutes.",
  },
});

/**
 * Limiter for QR code polling
 * Max 60 requests per minute
 */
const qrPollLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "too_many_requests",
    message: "Rate limit exceeded for QR validation.",
  },
});

module.exports = {
  authLimiter,
  emailLimiter,
  qrPollLimiter,
};
