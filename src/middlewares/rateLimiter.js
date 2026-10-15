const rateLimit = require("express-rate-limit");

/**
 * Feature flag for rate limiting across OneLogin API
 * Set ENABLE_RATE_LIMIT=true in .env to activate.
 * Defaults to false for seamless development and testing.
 */
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === "true";

// Pass-through middleware when rate limiting is disabled
const passThrough = (req, res, next) => next();

/**
 * Limiter for user login and token generation
 * Max 15 attempts per 15 minutes
 */
const authLimiter = ENABLE_RATE_LIMIT
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 15,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "too_many_requests",
        message:
          "Too many authentication attempts from this IP, please try again after 15 minutes.",
      },
    })
  : passThrough;

/**
 * Limiter for email verification requests to prevent email bombing
 * Max 5 attempts per 15 minutes
 */
const emailLimiter = ENABLE_RATE_LIMIT
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "too_many_requests",
        message: "Too many email requests, please try again after 15 minutes.",
      },
    })
  : passThrough;

/**
 * Limiter for QR code polling
 * Max 60 requests per minute
 */
const qrPollLimiter = ENABLE_RATE_LIMIT
  ? rateLimit({
      windowMs: 60 * 1000,
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "too_many_requests",
        message: "Rate limit exceeded for QR validation.",
      },
    })
  : passThrough;

module.exports = {
  authLimiter,
  emailLimiter,
  qrPollLimiter,
  ENABLE_RATE_LIMIT,
};
