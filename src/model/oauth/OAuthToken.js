const mongoose = require("mongoose");

const oauthTokenSchema = new mongoose.Schema({
  access_token: { type: String, required: true, unique: true },
  refresh_token: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client_id: { type: String, required: true },
  expires_at: { type: Date, required: true }, // Access token expiry
  refresh_expires_at: { type: Date, required: true }, // Refresh token expiry
}, { timestamps: true });

const OAuthToken = mongoose.model("OAuthToken", oauthTokenSchema);
module.exports = OAuthToken;
