const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

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
      default: false,
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
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.statics.findByCredentails = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error({error : "Invalid email or password"});
  const checkPassworMatch = await bcrypt.compare(password, user.password);
  if (!checkPassworMatch) {
    throw new Error({ error: "Invalid email or password" });
  }
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
