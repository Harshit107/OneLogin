const catchAsync = require("../utils/catchAsync");
const OAuthSession = require("../model/oauth/OAuthSession");

const clearSSOSession = async (req, res) => {
  const sessionId = req.cookies && req.cookies.sso_session;
  const isProd = process.env.NODE_ENV === "production" || (req.headers.host && req.headers.host.includes("harshit107.online"));
  if (sessionId) {
    await OAuthSession.deleteOne({ session_id: sessionId });
  }
  res.clearCookie("sso_session", {
    domain: isProd ? ".harshit107.online" : undefined,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};

exports.current = catchAsync(async (req, res) => {
  req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
  await req.user.save();
  await clearSSOSession(req, res);
  res.status(200).json({ message: "User logged out successfully" });
});

exports.all = catchAsync(async (req, res) => {
  req.user.tokens = [];
  await req.user.save();
  await OAuthSession.deleteMany({ user_id: req.user._id });
  res.clearCookie("sso_session");
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