const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const OAuthAuthCode = require("../../model/oauth/OAuthAuthCode");
const OAuthToken = require("../../model/oauth/OAuthToken");
const OAuthSession = require("../../model/oauth/OAuthSession");

const JWT_SECRET = process.env.JWT || "fallback_secret_for_development";

/**
 * Generate a random string of given length
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate an Authorization Code
 */
exports.generateAuthCode = async (user_id, client_id, redirect_uri) => {
  const code = generateRandomString(16);
  // Code expires in 60 seconds
  const expires_at = new Date(Date.now() + 60 * 1000); 

  const authCode = new OAuthAuthCode({
    code,
    user_id,
    client_id,
    redirect_uri,
    expires_at,
  });

  await authCode.save();
  return code;
};

/**
 * Generate Access and Refresh Tokens
 */
exports.generateTokens = async (user_id, client_id) => {
  // Access Token: JWT expiring in 15 minutes
  const access_token = jwt.sign(
    {
      user_id: user_id.toString(),
      client_id,
      scope: "read_user", // Default scope
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Refresh Token: Random string (or JWT), expiring in 7 days
  const refresh_token = generateRandomString(32);
  
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  const refresh_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const oauthToken = new OAuthToken({
    access_token,
    refresh_token,
    user_id,
    client_id,
    expires_at,
    refresh_expires_at,
  });

  await oauthToken.save();

  return {
    access_token,
    refresh_token,
    expires_in: 15 * 60, // seconds
  };
};

/**
 * Create an SSO Session
 */
exports.createSSOSession = async (user_id) => {
  const session_id = generateRandomString(32);
  // Session valid for 7 days (or any duration you prefer)
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

  const session = new OAuthSession({
    session_id,
    user_id,
    expires_at,
  });

  await session.save();
  return session_id;
};
