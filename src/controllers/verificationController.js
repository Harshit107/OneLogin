const User = require("../model/User.js");
const VerificationLink = require("../model/VerificationLink.js");
const validator = require("../utils/validator.js");
const freelyEmail = require("freely-email");
const {
  appName,
  appEmail,
  appReplyEmail,
  appVerificationUrl,
} = require("../config.js");
const { errorLog } = require("../services/admin/logs.js");
const checkStringMessage = require("../utils/stringHelper.js");

const sendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User is not registerd with us");

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

exports.sendEmail = async (req, res) => {
  try {
    const { email } = validator.emailValidator(req.body);
    await sendVerificationEmail(email);
    res.status(200).send({ msg: "Email Sent Successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};

exports.verify = async (req, res) => {
  try {
    const verificationUserLink = await VerificationLink.findById(req.params.id);
    if (!verificationUserLink) throw new Error("Invalid verification link");

    const user = await User.findOne({ email: verificationUserLink.email });
    user.isVerified = true;
    await user.save();

    await VerificationLink.findByIdAndDelete(req.params.id);
    res.status(200).send({ msg: "Email Verification Successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};

exports.sendVerificationEmail = sendVerificationEmail;
