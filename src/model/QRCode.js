const mongoose = require("mongoose");

const QRCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 120 * 1000), // 2 minutes expiration
      expires: 0, // MongoDB automatically deletes documents when expiresAt is reached
    },
  },
  {
    timestamps: true,
  }
);

const QRCode = mongoose.model("QRCode", QRCodeSchema);
module.exports = QRCode;
