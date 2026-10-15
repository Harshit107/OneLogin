const User = require("../model/User.js");
const Admin = require("../model/Admin.js");
const catchAsync = require("../utils/catchAsync");

exports.login = catchAsync(async (req, res) => {
  res.status(200).json({ message: "true" });
});

exports.isVerified = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ message: user ? user.isVerified : false });
});

exports.profile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isAdmin = await Admin.isAdminEmail(user.email);
  const userObj = user.toJSON();
  userObj.isAdmin = isAdmin;
  // Expose active session tokens so user can manage connected devices
  userObj.tokens = (user.tokens || []).map((t) => ({
    _id: t._id,
    token: t.token,
  }));

  res.status(200).json({ message: userObj });
});

exports.checkAdmin = catchAsync(async (req, res) => {
  const isAdmin = await Admin.isAdminEmail(req.user.email);
  res.status(200).json({
    isAdmin,
    email: req.user.email,
  });
});