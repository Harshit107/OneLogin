const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth/authService");
const { sendVerificationEmail } = require("./verificationController.js");
const { errorLog, successLog } = require("../services/admin/logs.js");

exports.create = catchAsync(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  // Send email asynchronously without blocking the response
  sendVerificationEmail(user.email)
    .then((d) => successLog("Verification email sent successfully", d))
    .catch((e) => errorLog("Error in sending verification email: " + e.message));

  res.status(201).json({
    user,
    token,
    userId: user._id,
    message: "User created successfully",
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token, ssoSessionId } = await authService.loginUser(email, password);

  res.cookie("sso_session", ssoSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  successLog("User Logged In Successfully");
  
  res.status(200).json({ 
    user, 
    token, 
    message: "User logged in successfully" 
  });
});
