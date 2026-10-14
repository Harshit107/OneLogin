const express = require("express");
const oauthController = require("../controllers/oauth/oauthController");
const oauthAuth = require("../middlewares/oauthAuth");
const { authLimiter } = require("../middlewares/rateLimiter");

const router = new express.Router();

// OAuth2 Endpoints
router.get("/authorize", oauthController.authorize);
router.post("/token", authLimiter, oauthController.token);

// Protected endpoints using Bearer Token
router.get("/userinfo", oauthAuth, oauthController.userinfo);

// Token revocation
router.post("/revoke-token", oauthController.revokeToken);

// Admin endpoints
router.post("/register-client", oauthController.registerClient);

module.exports = router;
