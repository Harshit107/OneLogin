const validator = require("validator");

const userValidator = (data) => {
  if (!data || !data.email || !data.password || data.password.length < 6)
    throw new Error("Check your email and password");

  if (!validator.isEmail(data.email))
    throw new Error("Invalid email or password");

  return { email: data.email, password: data.password};
};

module.exports = {
  userValidator,
};
