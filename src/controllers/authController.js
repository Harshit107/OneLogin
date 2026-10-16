const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth/authService");
const Admin = require("../model/Admin");
const { sendVerificationEmail } = require("./verificationController.js");
const { errorLog, successLog } = require("../services/admin/logs.js");

exports.create = catchAsync(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  const isAdmin = await Admin.isAdminEmail(user.email);
  const userObj = user.toJSON ? user.toJSON() : user;
  userObj.isAdmin = isAdmin;
  userObj.tokens = (user.tokens || []).map((t) => ({ _id: t._id, token: t.token }));

  // Send email asynchronously without blocking the response
  sendVerificationEmail(user.email).catch((e) =>
    errorLog("Error in sending verification email: " + e.message)
  );

  res.status(201).json({
    user: userObj,
    token,
    isAdmin,
    userId: user._id,
    message: "User created successfully",
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token, ssoSessionId } = await authService.loginUser(email, password);

  const isAdmin = await Admin.isAdminEmail(user.email);
  const userObj = user.toJSON ? user.toJSON() : user;
  userObj.isAdmin = isAdmin;
  userObj.tokens = (user.tokens || []).map((t) => ({ _id: t._id, token: t.token }));

  const isProd = process.env.NODE_ENV === "production" || (req.headers.host && req.headers.host.includes("harshit107.online"));

  res.cookie("sso_session", ssoSessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    domain: isProd ? ".harshit107.online" : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  successLog("User Logged In Successfully");

  res.status(200).json({
    user: userObj,
    token,
    isAdmin,
    message: "User logged in successfully"
  });
});
