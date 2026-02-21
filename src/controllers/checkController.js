const User = require("../model/User.js");
const checkStringMessage = require("../utils/stringHelper.js");

exports.login = async (req, res) => {
  res.status(200).send({ message: "true" });
};

exports.isVerified = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).send({ message: user.isVerified });
  } catch (error) {
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).send({ message: user });
  } catch (error) {
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};