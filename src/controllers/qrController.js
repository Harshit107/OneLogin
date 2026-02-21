const QRCode = require("../model/QRCode.js");
const { v4: uuidv4 } = require("uuid");
const { errorLog } = require("../services/admin/logs.js");

exports.store = async (req, res) => {
  try {
    const uniqueId = uuidv4();
    const newQrCode = new QRCode({ code: uniqueId });
    await newQrCode.save();
    res.send({ message: newQrCode.code });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: error.message });
  }
};

exports.storeToken = async (req, res) => {
  try {
    const { code } = req.body;
    const qrCodeResult = await QRCode.findOne({ code });

    if (!qrCodeResult || qrCodeResult.token)
      return res.status(400).send({ error: "Invalid QR-Code" });

    const newTokenForNewDevice = await req.user.generateToken();
    qrCodeResult.token = newTokenForNewDevice;
    await qrCodeResult.save();

    res.send({ message: "User Loggen in successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: error.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const { code } = req.body;
    const qrCodeResult = await QRCode.findOne({ code });

    if (!qrCodeResult || !qrCodeResult.token)
      return res.status(400).send({ error: "Waiting for user to scan qr code" });

    const newlyRegisteredToken = qrCodeResult.token;
    await QRCode.deleteOne({ _id: qrCodeResult._id });

    res.send({ message: "User Logged in successfully", token: newlyRegisteredToken });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: error.message });
  }
};