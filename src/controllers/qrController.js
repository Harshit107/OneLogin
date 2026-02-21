const QRCode = require("../model/QRCode.js");
const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

exports.store = catchAsync(async (req, res) => {
  const uniqueId = uuidv4();
  const newQrCode = new QRCode({ code: uniqueId });
  await newQrCode.save();
  res.status(201).json({ message: newQrCode.code });
});

exports.storeToken = catchAsync(async (req, res) => {
  const { code } = req.body;
  const qrCodeResult = await QRCode.findOne({ code });

  if (!qrCodeResult || qrCodeResult.token) {
    throw new ApiError(400, "Invalid QR-Code");
  }

  const newTokenForNewDevice = await req.user.generateToken();
  qrCodeResult.token = newTokenForNewDevice;
  await qrCodeResult.save();

  res.status(200).json({ message: "Device authorized successfully" });
});

exports.validate = catchAsync(async (req, res) => {
  const { code } = req.body;
  const qrCodeResult = await QRCode.findOne({ code });

  if (!qrCodeResult || !qrCodeResult.token) {
    throw new ApiError(400, "Waiting for user to scan QR code");
  }

  const newlyRegisteredToken = qrCodeResult.token;
  await QRCode.deleteOne({ _id: qrCodeResult._id });

  res.status(200).json({ 
    message: "User logged in successfully natively", 
    token: newlyRegisteredToken 
  });
});