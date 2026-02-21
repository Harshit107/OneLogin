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

const sendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User is not registered with us");
  }

  const link = new VerificationLink({ email });
  await link.save();

  await freelyEmail.sendLink({
    app: appName,
    recipient: email,
    sender: appEmail,
    replyTo: appReplyEmail,
    subject: "Email Verification",
    link: appVerificationUrl + link._id,
  });
};

exports.sendEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  await sendVerificationEmail(email);
  res.status(200).json({ msg: "Email Sent Successfully" });
});

exports.verify = catchAsync(async (req, res) => {
  const verificationUserLink = await VerificationLink.findById(req.params.id);
  
  if (!verificationUserLink) {
    throw new ApiError(400, "Invalid verification link");
  }

  const user = await User.findOne({ email: verificationUserLink.email });
  if (user) {
    user.isVerified = true;
    await user.save();
  }

  await VerificationLink.findByIdAndDelete(req.params.id);
  res.status(200).json({ msg: "Email Verification Successfully" });
});

exports.sendVerificationEmail = sendVerificationEmail;
