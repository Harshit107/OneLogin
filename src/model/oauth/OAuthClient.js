const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const oauthClientSchema = new mongoose.Schema({
  client_id: { type: String, required: true, unique: true },
  client_secret: { type: String, required: true },
  app_name: { type: String, required: true },
  redirect_uris: [{ type: String, required: true }],
  allowed_scopes: [{ type: String }],
}, { timestamps: true });

oauthClientSchema.pre("save", async function (next) {
  const client = this;
  if (client.isModified("client_secret")) {
    client.client_secret = await bcrypt.hash(client.client_secret, 8);
  }
  next();
});

oauthClientSchema.statics.findByCredentials = async function(client_id, client_secret) {
  const client = await this.findOne({ client_id });
  if (!client) throw new Error("Invalid client credentials");
  const isMatch = await bcrypt.compare(client_secret, client.client_secret);
  if (!isMatch) throw new Error("Invalid client credentials");
  return client;
};

const OAuthClient = mongoose.model("OAuthClient", oauthClientSchema);
module.exports = OAuthClient;
