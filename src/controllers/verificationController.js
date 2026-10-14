const User = require("../model/User.js");
const VerificationLink = require("../model/VerificationLink.js");
const catchAsync = require("../utils/catchAsync.js");
const ApiError = require("../utils/ApiError.js");
const freelyEmail = require("freely-email");
const {
  appName,
  appEmail,
  appReplyEmail,
  appVerificationUrl,
} = require("../config.js");

const crypto = require("crypto");

const sendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User is not registered with us");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const link = new VerificationLink({ email, token });
  await link.save();

  await freelyEmail.sendLink({
    app: appName,
    recipient: email,
    sender: appEmail,
    replyTo: appReplyEmail,
    subject: "Email Verification",
    link: appVerificationUrl + token,
  });
};

exports.sendEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  await sendVerificationEmail(email);
  res.status(200).json({ msg: "Email Sent Successfully" });
});

exports.verify = catchAsync(async (req, res) => {
  const identifier = req.params.id;
  // Look up by random token, or fallback to _id if legacy link
  let verificationUserLink = await VerificationLink.findOne({ token: identifier });
  if (!verificationUserLink && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    verificationUserLink = await VerificationLink.findById(identifier);
  }
  
  if (!verificationUserLink) {
    throw new ApiError(400, "Invalid or expired verification link");
  }

  if (verificationUserLink.expiresAt && verificationUserLink.expiresAt < new Date()) {
    await VerificationLink.deleteOne({ _id: verificationUserLink._id });
    throw new ApiError(400, "Verification link has expired");
  }

  const user = await User.findOne({ email: verificationUserLink.email });
  if (user) {
    user.isVerified = true;
    await user.save();
  }

  await VerificationLink.deleteOne({ _id: verificationUserLink._id });
  res.status(200).json({ msg: "Email Verification Successfully" });
});

exports.sendVerificationEmail = sendVerificationEmail;
