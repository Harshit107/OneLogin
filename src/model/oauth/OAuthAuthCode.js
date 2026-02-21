const mongoose = require("mongoose");

const oauthAuthCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client_id: { type: String, required: true },
  redirect_uri: { type: String, required: true },
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

const OAuthAuthCode = mongoose.model("OAuthAuthCode", oauthAuthCodeSchema);
module.exports = OAuthAuthCode;
