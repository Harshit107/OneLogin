const mongoose = require("mongoose");

const oauthAuthCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client_id: { type: String, required: true },
  redirect_uri: { type: String, required: true },
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false },
  code_challenge: { type: String },
  code_challenge_method: { type: String, default: "S256" },
  scope: { type: String, default: "read_user" },
}, { timestamps: true });

const OAuthAuthCode = mongoose.model("OAuthAuthCode", oauthAuthCodeSchema);
module.exports = OAuthAuthCode;
