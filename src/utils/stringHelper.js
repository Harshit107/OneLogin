/**
 * Helper to sanitize or format error messages for API responses
 */
const checkStringMessage = (message) => {
  if (!message || typeof message !== "string") {
    return "Authentication failed";
  }
  // Remove technical prefixes or internal noise if present
  if (message.includes("jwt expired")) {
    return "Session token has expired. Please log in again.";
  }
  if (message.includes("invalid token") || message.includes("jwt malformed")) {
    return "Invalid authentication token.";
  }
  return message;
};

module.exports = checkStringMessage;
