const catchAsync = require("../utils/catchAsync");

exports.current = catchAsync(async (req, res) => {
  req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
  await req.user.save();
  res.status(200).json({ message: "User logged out successfully" });
});

exports.all = catchAsync(async (req, res) => {
  req.user.tokens = [];
  await req.user.save();
  res.status(200).json({ message: "All devices logged out successfully" });
});

exports.allExceptCurrent = catchAsync(async (req, res) => {
  req.user.tokens = req.user.tokens.filter(t => t.token === req.token);
  await req.user.save();
  res.status(200).json({ message: "All devices except current logged out successfully" });
});

exports.device = catchAsync(async (req, res) => {
  const tokenToRemove = String(req.body.token);
  req.user.tokens = req.user.tokens.filter(t => t.token !== tokenToRemove);
  await req.user.save();
  res.status(200).json({ message: "Device logged out successfully" });
});