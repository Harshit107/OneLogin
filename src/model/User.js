const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Enter Valid Email-Id");
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
    },
    phone: {
      type: Number,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    userImage: {
      type: String,
    },
    tokens: [
      {
        token: {
          required: true,
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");
  const checkPasswordMatch = await bcrypt.compare(password, user.password);
  if (!checkPasswordMatch) {
    throw new Error("Invalid email or password");
  }
  return user;
};
// Backward compatibility alias
userSchema.statics.findByCredentails = userSchema.statics.findByCredentials;

userSchema.methods.generateToken = async function () {
  const user = this;
  const jwtSecret = process.env.JWT || process.env.jwt || "fallback_secret_for_development";
  const token = jwt.sign(
    {
      _id: user._id.toString(),
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  // Keep max 10 active tokens to prevent unbounded document bloat
  const updatedTokens = user.tokens ? user.tokens.slice(-9) : [];
  user.tokens = updatedTokens.concat({ token });

  await user.save();
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
