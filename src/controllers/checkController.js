const User = require("../model/User.js");
const catchAsync = require("../utils/catchAsync");

exports.login = catchAsync(async (req, res) => {
  res.status(200).json({ message: "true" });
});

exports.isVerified = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ message: user.isVerified });
});

exports.profile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ message: user });
});