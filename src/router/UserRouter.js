const express = require("express");
const router = new express.Router();
const User = require("../model/User.js");
const QRCode = require("../model/QRCode.js");
const validator = require("../Helper/Validator.js");
const userAuth = require("../auth/UserAuth.js");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const checkStringMessage = require("../Helper/StringHelper.js");
const forgetPasswordTemplate = require("../template/ForgetPasswordTemplate.js");
const freelyEmail = require("freely-email");
const {appName, appEmail, appReplyEmail, appVerificationUrl}  = require("../config.js")

//dev dependencies
const { errorLog, successLog, normalLog } = require("../adminSection/Logs.js");
const VerificationLink = require("../model/VerificationLink.js");
const { createDeveloper } = require("../database/FirebaseHelper.js");

// ===================    Method Area  ======================================

const showErrorLog = (message) => {
  errorLog(message);
};

const showSuccessLog = (message) => {
  successLog(message);
};

const createTemporaryVerificationLink = async (email) => {

  const newVerificationLink = await new VerificationLink({email});
  if(!newVerificationLink)
    throw new Error('Verification link not created, please try again after sometime');
  await newVerificationLink.save();
  return (appVerificationUrl +  newVerificationLink._id);  
}



/* # # # # # # # # # # # # # #  # # # # # # # # # # # # # # # # # # # # # # # # # # # # */

/*                                 Create and Login                              */

/* # # # # # # # # # # # # # #  # # # # # # # # # # # # # # # # # # # # # # # # # # # # */

/* -------------------------------------------------------------------------- */
/*                                 Create User                                */
/* -------------------------------------------------------------------------- */

router.post("/create", async (req, res) => {
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
    const userId = newUser._id;

    const securityKey = await createDeveloper(userId);

    res.status(201).send({
      user: newUser,
      token: token,
      userId: userId,
      message: "User created successfully",
      securityKey,
    });
  } catch (err) {
    showErrorLog(err.message);
    if (isUserCreated) {
      await User.findOneAndDelete({
        email: req.body.email,
      });
      showErrorLog("deleted new created user");
    }
    return res.status(400).send({ error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                 Login User                                 */
/* -------------------------------------------------------------------------- */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = validator.userValidator(req.body);

    const user = await User.findByCredentails(email, password);
    const token = await user.generateToken();
    showSuccessLog("User Logged In Successfully");
    res.status(200).send({
      user,
      token,
      message: "User logged in successfully",
    });
  } catch (error) {
    showErrorLog(error.message);
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});

/* -------------------------------------------------------------------------- */
/*                             Login using QR code                            */
/* -------------------------------------------------------------------------- */

router.post("/login/qr/store", async (req, res) => {
  try {
    const uniqueId = uuidv4();
    const newQrCode = new QRCode({ code: uniqueId });

    if (!newQrCode)
      return res
        .status(400)
        .send({ error: "QR Code not generate, try again!" });

    await newQrCode.save();

    res.send({ message: newQrCode.code });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                             Login using QR code - add token                          */
/* -------------------------------------------------------------------------- */

router.post("/login/qr/storetoken", userAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).send({ error: "QR-Code not found" });

    const qrCodeResult = await QRCode.findOne({ code });

    if (!qrCodeResult)
      return res.status(400).send({ error: "Invalid QR-Code" });

    if (qrCodeResult.token)
      return res
        .status(400)
        .send({ error: "User is already registered with this QR-code" });

    const newTokenForNewDevice = await req.user.generateToken();

    qrCodeResult.token = newTokenForNewDevice;
    await qrCodeResult.save();

    res.send({ message: "User Loggen in successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                             Login using QR code - validate                          */
/* -------------------------------------------------------------------------- */

router.post("/login/qr/validate", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).send({ error: "QR-Code not found" });

    const qrCodeResult = await QRCode.findOne({ code });
    if (!qrCodeResult)
      return res.status(400).send({ error: "Invalid QR-Code" });

    if (!qrCodeResult.token)
      return res
        .status(400)
        .send({ error: "Waiting for user to scan qr code" });

    const newlyRegisteredToken = qrCodeResult.token;
    await QRCode.deleteOne({ _id: qrCodeResult._id });

    res.send({
      message: "User Logged in successfully",
      token: newlyRegisteredToken,
    });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                        ***** Logout Section  ******                        */

/* -------------------------------------------------------------------------- */
/*                                 Logout User                                */
/* -------------------------------------------------------------------------- */

router.post("/logout", userAuth, async (req, res) => {
  try {
    const tokenToRemove = req.token;
    const user = req.user;

    user.tokens = user.tokens.filter((token) => token.token !== tokenToRemove);
    await user.save();
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    showErrorLog(error.message);
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});

/* -------------------------------------------------------------------------- */
/*                        Logout User from every device                       */
/* -------------------------------------------------------------------------- */

router.post("/logout/all", userAuth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = [];

    await user.save();
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    showErrorLog(error.message);
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});

/* -------------------------------------------------------------------------- */
/*                        Logout User from every device                       */
/* -------------------------------------------------------------------------- */

router.post("/logout/all/current", userAuth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = user.tokens.filter((token) => token.token === req.token);
    await user.save();
    res.send({ message: "All user except current logged out successfully" });
  } catch (error) {
    showErrorLog(error.message);
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});

/* -------------------------------------------------------------------------- */
/*                          Logout User from specific                         */
/* -------------------------------------------------------------------------- */

router.post("/logout/device", userAuth, async (req, res) => {
  try {
    const tokenToRemove = req.body.token + "";
    const user = req.user;

    if (!tokenToRemove) {
      return res.status(403).send({ error: "No Device Found" });
    }

    const allToken = user.tokens.filter(
      (token) => token.token !== tokenToRemove
    );

    if (allToken.length === user.tokens.length)
      return res.status(400).send({ error: "Device not found in login list" });

    user.tokens = allToken;
    await user.save();
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    showErrorLog(error.message);
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});

/* ------------------------------------------------------------------------------- */
/*                                 Send Verification mail                            
/* ------------------------------------------------------------------------------- */

router.post("/verification/email", async (req, res) => {
  try {

    const { email } = validator.emailValidator(req.body);
    const user = await User.findOne({ email});
    if(!user)
      throw new Error("User is not registerd with us");
      
    const temporaryVerificationLink = await createTemporaryVerificationLink(
      email
    );

    const verificationEmailObject = {
      app : appName,
      recipient : email,
      sender : appEmail,
      replyTo : appReplyEmail,
      subject: "Email Verification",
      link : temporaryVerificationLink
    }

    const emailInfo = await freelyEmail.sendLink(verificationEmailObject);
    res.status(200).send({msg : "Email Sent Successfully", emailInfo});   


  } catch (error) {
    showErrorLog(error)
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});



/* -------------------------------------------------------------------------- */
/*                             email verification                             */
/* -------------------------------------------------------------------------- */

router.get("/verification/email/:id", async (req, res) => {
  try {
    const verificationId = req.params.id;
    const verificationUserLink = await VerificationLink.findById(verificationId);

    if (!verificationUserLink)
      throw new Error("Invalid verification link or link expired");

    const user = await User.findOne({
      email: verificationUserLink.email
    });
    if (!user) throw new Error("User not found");

    user.isVerified = true;
    await user.save();
    await VerificationLink.findByIdAndDelete(verificationId);

    res.status(200).send({ msg: "Email Verification Successfully" });
    
  } catch (error) {
    showErrorLog(error);
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});





// ​‌‍‌⁡⁢⁣⁢𝘂𝗻𝗱𝗲𝗰𝗶𝗱𝗲𝗱⁡​
/* -------------------------------------------------------------------------- */
/*                               forget password                              */
/* -------------------------------------------------------------------------- */

router.get("/forget", async (req, res) => {
  try {
    const { email } =
      { email: "harshit107.in@gmail.com" } ||
      validator.emailValidator(req.body);
    showSuccessLog(email);
    const emailTemplate = forgetPasswordTemplate(
      "http://localhost:3001/checkserver"
    );

    const emailResult = await freelyEmail.sendLink({
      app: "OneLogin",
      subject: "Forget Password",
      recipient: email,
      sender: "OneLogin",
      replyTo: "support@oneLogin.com",
      link: "214758",
      HTMLfile: emailTemplate,
    });
    if (emailResult.data) console.log("Success > ", emailResult.data);
    else console.log("Error  > ", emailResult.error);
    res.send("Don");
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

/* # # # # # # # # # # # # # #  # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

  - Checks      

 # # # # # # # # # # # # # #  # # # # # # # # # # # # # # # # # # # # # # # # # # # # */

/* -------------------------------------------------------------------------- */
/*                             Check is User Login                            */
/* -------------------------------------------------------------------------- */

router.get("/check/login", userAuth, async (req, res) => {
  try {
    res.status(200).send({ message: "true" });
  } catch (error) {
    showErrorLog(error.message);
    res.status(400).send({ error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                           check user is verified                           */
/* -------------------------------------------------------------------------- */

router.get("/isVerified", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).send({ message: user.isVerified });
  } catch (error) {
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});

/* -------------------------------------------------------------------------- */
/*                          checking profile from Id                          */
/* -------------------------------------------------------------------------- */

router.get("/profile", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).send({ message: user });
  } catch (error) {
    return res.status(400).send({ error: checkStringMessage(error.message) });
  }
});

module.exports = router;
