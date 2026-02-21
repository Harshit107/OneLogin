const mongoose = require("mongoose");

const oauthSessionSchema = new mongoose.Schema({
  session_id: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expires_at: { type: Date, required: true },
}, { timestamps: true });

const OAuthSession = mongoose.model("OAuthSession", oauthSessionSchema);
module.exports = OAuthSession;
