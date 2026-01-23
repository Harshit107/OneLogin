const checkStringMessage = require("../Helper/StringHelper.js");
const { errorLog } = require("../adminSection/Logs.js");

exports.current = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};

exports.all = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};

exports.allExceptCurrent = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(t => t.token === req.token);
    await req.user.save();
    res.send({ message: "All user except current logged out successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};

exports.device = async (req, res) => {
  try {
    const tokenToRemove = req.body.token + "";
    req.user.tokens = req.user.tokens.filter(t => t.token !== tokenToRemove);
    await req.user.save();
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    errorLog(error.message);
    res.status(400).send({ error: checkStringMessage(error.message) });
  }
};