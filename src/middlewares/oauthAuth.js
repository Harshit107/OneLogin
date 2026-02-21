const jwt = require("jsonwebtoken");
const OAuthToken = require("../model/oauth/OAuthToken");
const User = require("../model/User");

const JWT_SECRET = process.env.JWT || "fallback_secret_for_development";

const oauthAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "unauthorized", message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify token exists in DB and is not revoked
    const tokenRecord = await OAuthToken.findOne({ access_token: token, user_id: decoded.user_id });
    if (!tokenRecord) {
      return res.status(401).json({ error: "unauthorized", message: "Token revoked or invalid" });
    }

    if (tokenRecord.expires_at < new Date()) {
       return res.status(401).json({ error: "unauthorized", message: "Token expired" });
    }

    // Find User
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({ error: "unauthorized", message: "User not found" });
    }

    req.user = user;
    req.client_id = decoded.client_id;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "unauthorized", message: "Token expired" });
    }
    return res.status(401).json({ error: "unauthorized", message: "Please authenticate." });
  }
};

module.exports = oauthAuth;
