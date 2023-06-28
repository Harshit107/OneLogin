const jwt = require("jsonwebtoken");
const User = require("../model/User.js");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({ _id: decode._id, "tokens.token": token });
    if (!user)
      return res.status(401).send({ error: "Authentication Required" });
    if (!user.isVerified)
      return res.status(403).send({ error: "Email is Not Verified"});
    req.user = user;
    req.token = token;

    next();

  } catch (error) {
    console.log({ error });
    res.status(401).send(error);
  }
};
module.exports = userAuth;
