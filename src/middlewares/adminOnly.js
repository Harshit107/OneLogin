const Admin = require("../model/Admin");
const ApiError = require("../utils/ApiError");

/**
 * Middleware that restricts access strictly to verified administrators
 */
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const isAdmin = await Admin.isAdminEmail(req.user.email);
    if (!isAdmin) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Administrator privileges required. This feature is restricted to administrators.",
      });
    }

    req.isAdmin = true;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = adminOnly;
