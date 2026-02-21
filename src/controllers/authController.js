const User = require("../model/User.js");
const validator = require("../utils/validator.js");
const { errorLog, successLog } = require("../services/admin/logs.js");
const checkStringMessage = require("../utils/stringHelper.js");
const { sendVerificationEmail } = require("./verificationController.js");
const { createSSOSession } = require("../services/oauth/tokenService");

exports.create = async (req, res) => {
  let isUserCreated = false;
  try {
    const { email } = validator.userValidator(req.body);
    const user = await User.find({ email });
    if (user.length > 0)
      return res
        .status(400)
        .send({ error: "user is already registered with us" });

    const newUser = new User(req.body);
    if (!newUser)
      return res.status(403).send({
        error: "Registration Failed!",
        message: "check your input data",
      });

    await newUser.save();

    isUserCreated = true;

    const token = await newUser.generateToken();
    sendVerificationEmail(email)
      .then((d) => successLog("Verification email sent successfully", d))
      .catch((e) =>
        errorLog("Error in sending verification email: " + e.message),
      );
    const userId = newUser._id;

    res.status(201).send({
      user: newUser,
      token,
      userId,
      message: "User created successfully",
    });
  } catch (error) {
    errorLog(error.message);
    if (isUserCreated) {
      await User.findOneAndDelete({ email: req.body.email });
    }
    return res.status(400).send({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = validator.userValidator(req.body);
    const user = await User.findByCredentails(email, password);
    const token = await user.generateToken();
    const ssoSessionId = await createSSOSession(user._id);

    res.cookie("sso_session", ssoSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only secure in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    successLog("User Logged In Successfully");
    res
      .status(200)
      .send({ user, token, message: "User logged in successfully" });
  } catch (error) {
    errorLog(error.message);
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
};
