const express = require("express");
const router = new express.Router();

const userAuth = require("../middlewares/userAuth");

const auth = require("../controllers/authController");
const qr = require("../controllers/qrController");
const logout = require("../controllers/logoutController");
const verification = require("../controllers/verificationController");
const check = require("../controllers/checkController");

router.post("/create", auth.create);
router.post("/login", auth.login);

router.post("/login/qr/store", qr.store);
router.post("/login/qr/storetoken", userAuth, qr.storeToken);
router.post("/login/qr/validate", qr.validate);

router.post("/logout", userAuth, logout.current);
router.post("/logout/all", userAuth, logout.all);
router.post("/logout/all/current", userAuth, logout.allExceptCurrent);
router.post("/logout/device", userAuth, logout.device);

router.post("/verification/email", verification.sendEmail);
router.get("/verification/email/:id", verification.verify);

router.get("/check/login", userAuth, check.login);
router.get("/isVerified", userAuth, check.isVerified);
router.get("/profile", userAuth, check.profile);

module.exports = router;
