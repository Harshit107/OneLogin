const OAuthClient = require("../../model/oauth/OAuthClient");
const OAuthAuthCode = require("../../model/oauth/OAuthAuthCode");
const OAuthToken = require("../../model/oauth/OAuthToken");
const OAuthSession = require("../../model/oauth/OAuthSession");
const User = require("../../model/User");
const tokenService = require("../../services/oauth/tokenService");

/**
 * @route GET /oauth/authorize
 * @desc Initiates the OAuth flow. If SSO session exists, issues AuthCode and redirects back to Client.
 *       Otherwise, redirects to SSO Login screen.
 */
exports.authorize = async (req, res) => {
  try {
    const { client_id, redirect_uri, response_type, state, scope, code_challenge, code_challenge_method } = req.query;

    if (!client_id || !redirect_uri || response_type !== "code") {
      return res.status(400).json({ error: "invalid_request", message: "Missing required parameters or unsupported response_type" });
    }

    // Validate Client
    const client = await OAuthClient.findOne({ client_id });
    if (!client) {
      return res.status(400).json({ error: "invalid_client", message: "Client not found" });
    }

    // Strict redirect_uri matching
    if (!client.redirect_uris.includes(redirect_uri)) {
      return res.status(400).json({ error: "invalid_redirect_uri", message: "Redirect URI mismatch" });
    }

    // Check for SSO session cookie
    const ssoCookie = req.cookies.sso_session;
    let userId = null;

    if (ssoCookie) {
      // Validate session
      const session = await OAuthSession.findOne({ session_id: ssoCookie });
      if (session && session.expires_at > new Date()) {
        userId = session.user_id;
      }
    }

    if (!userId) {
      // User is not logged in. Redirect to SSO login page.
      // Append original query parameters so the frontend knows where to return after login.
      const queryParams = new URLSearchParams(req.query).toString();
      // Assuming frontend login page is at origin/login (can be configured)
      const loginUrl = process.env.SSO_LOGIN_URL || `http://localhost:3000/login`;
      return res.redirect(`${loginUrl}?${queryParams}`);
    }

    // User is logged in. Generate Authorization Code with PKCE and scope.
    const code = await tokenService.generateAuthCode(userId, client_id, redirect_uri, {
      code_challenge,
      code_challenge_method,
      scope,
    });

    // Redirect to Client Callback
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append("code", code);
    if (state) {
      redirectUrl.searchParams.append("state", state);
    }

    return res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("Authorize Error:", error);
    return res.status(500).json({ error: "server_error" });
  }
};

/**
 * @route POST /oauth/token
 * @desc Exchange AuthCode for Access & Refresh Tokens
 */
exports.token = async (req, res) => {
  try {
    const { client_id, client_secret, grant_type, code, redirect_uri, refresh_token, code_verifier } = req.body;

    // Validate Client Credentials
    if (!client_id || !client_secret) {
       return res.status(401).json({ error: "invalid_client", message: "Missing client credentials" });
    }

    let client;
    try {
      client = await OAuthClient.findByCredentials(client_id, client_secret);
    } catch (e) {
      return res.status(401).json({ error: "invalid_client", message: "Invalid client credentials" });
    }

    if (grant_type === "authorization_code") {
      if (!code || !redirect_uri) {
        return res.status(400).json({ error: "invalid_request", message: "Missing code or redirect_uri" });
      }

      // Find and validate the authorization code
      const authCode = await OAuthAuthCode.findOne({ code, client_id, used: false });
      
      if (!authCode) {
        return res.status(400).json({ error: "invalid_grant", message: "Invalid or used authorization code" });
      }

      if (authCode.expires_at < new Date()) {
        return res.status(400).json({ error: "invalid_grant", message: "Authorization code expired" });
      }

      if (authCode.redirect_uri !== redirect_uri) {
         return res.status(400).json({ error: "invalid_grant", message: "Redirect URI mismatch" });
      }

      // PKCE verification (RFC 7636)
      if (authCode.code_challenge) {
        const isPKCEValid = tokenService.verifyPKCE(
          code_verifier,
          authCode.code_challenge,
          authCode.code_challenge_method
        );
        if (!isPKCEValid) {
          return res.status(400).json({ error: "invalid_grant", message: "PKCE verification failed" });
        }
      }

      // Mark the code as used to prevent replay attacks
      authCode.used = true;
      await authCode.save();

      // Issue tokens
      const tokenResponse = await tokenService.generateTokens(authCode.user_id, client_id, authCode.scope);
      return res.status(200).json({
        access_token: tokenResponse.access_token,
        token_type: "Bearer",
        expires_in: tokenResponse.expires_in,
        refresh_token: tokenResponse.refresh_token,
        scope: authCode.scope
      });

    } else if (grant_type === "refresh_token") {
      if (!refresh_token) {
        return res.status(400).json({ error: "invalid_request", message: "Missing refresh_token" });
      }

      // Find token
      const tokenRecord = await OAuthToken.findOne({ refresh_token, client_id });
      if (!tokenRecord) {
        return res.status(400).json({ error: "invalid_grant", message: "Invalid refresh token" });
      }

      if (tokenRecord.refresh_expires_at < new Date()) {
         return res.status(400).json({ error: "invalid_grant", message: "Refresh token expired" });
      }

      // Revoke the old tokens by deleting
      await OAuthToken.findByIdAndDelete(tokenRecord._id);

      // Issue new tokens
      const tokenResponse = await tokenService.generateTokens(tokenRecord.user_id, client_id);
      return res.status(200).json({
        access_token: tokenResponse.access_token,
        token_type: "Bearer",
        expires_in: tokenResponse.expires_in,
        refresh_token: tokenResponse.refresh_token
      });

    } else {
      return res.status(400).json({ error: "unsupported_grant_type" });
    }

  } catch (error) {
    console.error("Token Error:", error);
    return res.status(500).json({ error: "server_error" });
  }
};

/**
 * @route GET /oauth/userinfo
 * @desc Get user info using Access Token
 */
exports.userinfo = async (req, res) => {
  try {
    // req.user and req.client_id are set by middleware `oauthAuth.js`
    const user = await User.findById(req.user._id).select("name email userImage isVerified");
    if (!user) {
      return res.status(404).json({ error: "user_not_found" });
    }

    res.status(200).json({
      sub: user._id,
      name: user.name,
      email: user.email,
      picture: user.userImage,
      email_verified: user.isVerified
    });
  } catch (error) {
    console.error("Userinfo Error:", error);
    return res.status(500).json({ error: "server_error" });
  }
};

/**
 * @route POST /oauth/revoke-token
 * @desc Revoke an access token or session
 */
exports.revokeToken = async (req, res) => {
  try {
    const { token, token_type_hint } = req.body;
    if (!token) {
      return res.status(400).json({ error: "invalid_request", message: "Missing token" });
    }

    if (token_type_hint === "access_token") {
       await OAuthToken.findOneAndDelete({ access_token: token });
    } else if (token_type_hint === "refresh_token") {
       await OAuthToken.findOneAndDelete({ refresh_token: token });
    } else {
       // Search both
       await OAuthToken.findOneAndDelete({ $or: [{ access_token: token }, { refresh_token: token }] });
    }

    return res.status(200).json({ message: "Token revoked" });
  } catch (error) {
    console.error("Revoke Token Error:", error);
    return res.status(500).json({ error: "server_error" });
  }
};

/**
 * @route POST /oauth/register-client
 * @desc Admin only: create new OAuth clients
 */
const crypto = require("crypto");

const safeCompare = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

exports.registerClient = async (req, res) => {
  try {
    const adminSecret = req.headers["x-admin-secret"];
    const expectedSecret = process.env.ADMIN_SECRET || (process.env.NODE_ENV !== "production" ? "super_secret_admin_key" : null);

    if (!expectedSecret || !adminSecret || !safeCompare(adminSecret, expectedSecret)) {
      return res.status(403).json({ error: "unauthorized", message: "Invalid or missing admin credentials" });
    }

    const { app_name, redirect_uris, allowed_scopes } = req.body;

    if (!app_name || typeof app_name !== "string") {
      return res.status(400).json({ error: "invalid_request", message: "app_name is required" });
    }

    if (!Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({ error: "invalid_request", message: "redirect_uris must be a non-empty array" });
    }

    // Generate credentials
    const client_id = crypto.randomBytes(12).toString("hex");
    const client_secret = crypto.randomBytes(24).toString("hex"); // Plain secret returned once

    const client = new OAuthClient({
      client_id,
      client_secret: client_secret, // Will be hashed via pre-save hook
      app_name,
      redirect_uris,
      allowed_scopes: allowed_scopes || ["read_user"]
    });

    await client.save();

    res.status(201).json({
      client_id,
      client_secret, // Return plain text here so user can copy it!
      app_name,
      redirect_uris,
      allowed_scopes: client.allowed_scopes
    });

  } catch (error) {
    console.error("Register Client Error:", error);
    return res.status(500).json({ error: "server_error", message: error.message });
  }
};
