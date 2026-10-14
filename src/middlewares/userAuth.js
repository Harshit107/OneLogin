const jwt = require("jsonwebtoken");
const User = require("../model/User.js");
require("dotenv").config();
const checkStringMessage = require("../utils/stringHelper.js");
const {errorLog : showErrorMessage} = require("../services/admin/logs.js");

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const jwtSecret = process.env.JWT || process.env.jwt || "fallback_secret_for_development";
    const decode = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ _id: decode._id, "tokens.token": token });

    if (!user) {
      return res.status(401).json({ error: "Authentication Required" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Email is Not Verified" });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    showErrorMessage("Message from UserAuth catch: " + error.message);
    return res.status(401).json({ error: checkStringMessage(error.message) });
  }
};
module.exports = userAuth;
