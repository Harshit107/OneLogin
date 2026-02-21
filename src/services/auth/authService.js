const User = require("../../model/User.js");
const ApiError = require("../../utils/ApiError");
const { createSSOSession } = require("../oauth/tokenService");

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError(400, "User is already registered with us");
  }

  const newUser = await User.create(userData);
  if (!newUser) {
    throw new ApiError(403, "Registration Failed! Check your input data");
  }

  const token = await newUser.generateToken();

  return { user: newUser, token };
};

const loginUser = async (email, password) => {
  const user = await User.findByCredentials(email, password);
  if (!user) {
     throw new ApiError(401, "Invalid email or password");
  }

  const token = await user.generateToken();
  const ssoSessionId = await createSSOSession(user._id);

  return { user, token, ssoSessionId };
};

module.exports = {
  registerUser,
  loginUser,
};
