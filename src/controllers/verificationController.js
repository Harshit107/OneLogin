const User = require("../model/User.js");
const VerificationLink = require("../model/VerificationLink.js");
const catchAsync = require("../utils/catchAsync.js");
const ApiError = require("../utils/ApiError.js");
const crypto = require("crypto");
const freelyEmailService = require("../services/email/freelyEmailService");
const { errorLog, successLog } = require("../services/admin/logs");

/**
 * Dispatches account email verification link via FreelyEmail live server.
 */
const sendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User is not registered with us");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const link = new VerificationLink({ email, token });
  await link.save();

  // Asynchronously dispatch via live FreelyEmail service without blocking
  freelyEmailService
    .sendVerificationLink(email, token)
    .then(() => successLog(`Verification email dispatched to ${email}`))
    .catch((err) =>
      errorLog(`Failed to dispatch verification email via FreelyEmail: ${err.message}`)
    );

  return token;
};

/**
 * POST /users/verification/email
 * Manual trigger from user profile to re-send verification email
 */
exports.sendEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email address is required");
  }

  await sendVerificationEmail(email);
  res.status(200).json({ msg: "Verification email sent successfully" });
});

/**
 * GET /users/verification/email/:id
 * Confirms user verification token
 */
exports.verify = catchAsync(async (req, res) => {
  const identifier = req.params.id;
  // Look up by random token, or fallback to _id if legacy link
  let verificationUserLink = await VerificationLink.findOne({ token: identifier });
  if (!verificationUserLink && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    verificationUserLink = await VerificationLink.findById(identifier);
  }

  if (!verificationUserLink) {
    throw new ApiError(400, "Invalid or expired verification link");
  }

  if (verificationUserLink.expiresAt && verificationUserLink.expiresAt < new Date()) {
    await VerificationLink.deleteOne({ _id: verificationUserLink._id });
    throw new ApiError(400, "Verification link has expired. Please request a new one.");
  }

  const user = await User.findOne({ email: verificationUserLink.email });
  if (user) {
    user.isVerified = true;
    await user.save();

    // Send Welcome Email asynchronously
    freelyEmailService
      .sendWelcomeEmail(user.email, user.name)
      .catch((err) => errorLog(`Failed to dispatch welcome email: ${err.message}`));
  }

  await VerificationLink.deleteOne({ _id: verificationUserLink._id });
  res.status(200).json({ msg: "Email verified successfully" });
});

/**
 * POST /users/password/forgot
 * Initiates password recovery flow via FreelyEmail live server
 */
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email address is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No account found with this email address");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const link = new VerificationLink({ email, token });
  await link.save();

  // Asynchronously dispatch password reset link via FreelyEmail
  freelyEmailService
    .sendPasswordResetLink(email, token)
    .then(() => successLog(`Password reset email dispatched to ${email}`))
    .catch((err) =>
      errorLog(`Failed to dispatch password reset email: ${err.message}`)
    );

  res.status(200).json({
    msg: "Password reset link has been dispatched to your email",
    resetToken: token, // Expose for testing/dev environments
  });
});

/**
 * POST /users/password/reset
 * Completes password update using reset token and dispatches security alert
 */
exports.resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }
  if (newPassword.length < 7) {
    throw new ApiError(400, "Password must be at least 7 characters long");
  }

  const verificationUserLink = await VerificationLink.findOne({ token });
  if (!verificationUserLink) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  if (verificationUserLink.expiresAt && verificationUserLink.expiresAt < new Date()) {
    await VerificationLink.deleteOne({ _id: verificationUserLink._id });
    throw new ApiError(400, "Password reset token has expired. Please request a new one.");
  }

  const user = await User.findOne({ email: verificationUserLink.email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = newPassword;
  await user.save();
  await VerificationLink.deleteOne({ _id: verificationUserLink._id });

  // Send Security Alert Notification via FreelyEmail
  freelyEmailService
    .sendPasswordChangedNotice(user.email, user.name)
    .catch((err) => errorLog(`Failed to dispatch security notice: ${err.message}`));

  res.status(200).json({
    msg: "Password successfully updated! You can now sign in with your new password.",
  });
});

exports.sendVerificationEmail = sendVerificationEmail;
