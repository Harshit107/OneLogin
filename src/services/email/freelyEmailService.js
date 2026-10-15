const { errorLog, successLog } = require("../admin/logs");

/**
 * FreelyEmail Live Service Integration
 * Connects OneLogin with the live FreelyEmail API service (https://freelyemail-api.harshit107.online).
 */

const getBaseUrl = () => {
  return (
    process.env.FREELY_EMAIL_BASE_URL ||
    "https://freelyemail-api.harshit107.online"
  ).replace(/\/+$/, "");
};

const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    "https://account.harshit107.online"
  ).replace(/\/+$/, "");
};

const APP_NAME = "OneLogin";
const APP_SENDER = "OneLogin";
const APP_REPLY_TO = process.env.APP_REPLY_EMAIL || "support@harshit107.online";

/**
 * Helper to dispatch HTTP request to FreelyEmail API with timeout
 */
async function postToFreelyEmail(endpoint, payload, timeoutMs = 20000) {
  const url = `${getBaseUrl()}${endpoint}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg =
        data?.error?.message ||
        data?.message ||
        `FreelyEmail HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    clearTimeout(timer);
    if (error.name === "AbortError") {
      throw new Error(`FreelyEmail request timed out after ${timeoutMs / 1000}s`);
    }
    throw error;
  }
}

/**
 * 1. Send Account Email Verification Link
 * Used during user registration and profile re-verification.
 */
async function sendVerificationLink(recipient, token, options = {}) {
  const frontendBase = getFrontendUrl();
  const verificationUrl = `${frontendBase}/auth?verify=${token}`;

  const payload = {
    app: APP_NAME,
    sender: APP_SENDER,
    recipient,
    replyTo: APP_REPLY_TO,
    subject: "OneLogin - Verify Your Email Address",
    link: verificationUrl,
    buttonText: "Verify My Email",
    withValidTime: options.withValidTime || 1440, // 24 hours
  };

  try {
    const result = await postToFreelyEmail(
      "/api/v1/emails/verification/link",
      payload
    );
    successLog(`[FreelyEmail] Verification link sent to ${recipient}`);
    return result;
  } catch (err) {
    errorLog(
      `[FreelyEmail] Failed to send verification link to ${recipient}: ${err.message}`
    );
    throw err;
  }
}

/**
 * 2. Send Password Reset Link
 * Used during forgot password flow.
 */
async function sendPasswordResetLink(recipient, token, options = {}) {
  const frontendBase = getFrontendUrl();
  const resetUrl = `${frontendBase}/auth?resetToken=${token}`;

  const payload = {
    app: APP_NAME,
    sender: APP_SENDER,
    recipient,
    replyTo: APP_REPLY_TO,
    subject: "OneLogin - Password Reset Request",
    link: resetUrl,
    buttonText: "Reset My Password",
    withValidTime: options.withValidTime || 60, // 60 minutes
  };

  try {
    const result = await postToFreelyEmail(
      "/api/v1/emails/verification/link",
      payload
    );
    successLog(`[FreelyEmail] Password reset link sent to ${recipient}`);
    return result;
  } catch (err) {
    errorLog(
      `[FreelyEmail] Failed to send password reset link to ${recipient}: ${err.message}`
    );
    throw err;
  }
}

/**
 * 3. Send Security Notice / Password Changed Notification
 * Dispatched when a password is reset or updated.
 */
async function sendPasswordChangedNotice(recipient, name = "User") {
  const frontendBase = getFrontendUrl();
  const payload = {
    app: APP_NAME,
    sender: `${APP_NAME} Security`,
    recipient,
    replyTo: APP_REPLY_TO,
    subject: "Security Notice: Your OneLogin Password Was Updated",
    message: `Hello ${name},\n\nYour OneLogin account password was recently updated. If you initiated this change, no further action is required.\n\nIf you did NOT request this change, please reset your password immediately at:\n${frontendBase}/auth\n\nSecurity Team,\nOneLogin SSO Platform`,
  };

  try {
    const result = await postToFreelyEmail("/api/v1/emails/send", payload);
    successLog(`[FreelyEmail] Security alert dispatched to ${recipient}`);
    return result;
  } catch (err) {
    errorLog(
      `[FreelyEmail] Failed to send security alert to ${recipient}: ${err.message}`
    );
  }
}

/**
 * 4. Send Welcome Email
 * Dispatched after account email verification completes.
 */
async function sendWelcomeEmail(recipient, name = "there") {
  const frontendBase = getFrontendUrl();
  const payload = {
    app: APP_NAME,
    sender: APP_SENDER,
    recipient,
    replyTo: APP_REPLY_TO,
    subject: "Welcome to OneLogin SSO Platform!",
    message: `Hi ${name},\n\nWelcome to OneLogin! Your account is now verified.\n\nYou can access your central profile and sign in to any connected app seamlessly using your OneLogin credentials.\n\nAccess your account: ${frontendBase}\n\nBest regards,\nThe OneLogin Team`,
  };

  try {
    const result = await postToFreelyEmail("/api/v1/emails/send", payload);
    successLog(`[FreelyEmail] Welcome email sent to ${recipient}`);
    return result;
  } catch (err) {
    errorLog(
      `[FreelyEmail] Failed to send welcome email to ${recipient}: ${err.message}`
    );
  }
}

/**
 * Health check on FreelyEmail live server
 */
async function checkServiceHealth() {
  const url = `${getBaseUrl()}/api/v1/health`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res.status === 200;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

module.exports = {
  sendVerificationLink,
  sendPasswordResetLink,
  sendPasswordChangedNotice,
  sendWelcomeEmail,
  checkServiceHealth,
  getBaseUrl,
};
