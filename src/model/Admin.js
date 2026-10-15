const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "superadmin"],
    },
    addedBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Checks whether an email belongs to an administrator.
 * Automatically checks the database, falling back to ADMIN_EMAIL env or default owner,
 * and auto-seeds the database if matching the default admin.
 */
adminSchema.statics.isAdminEmail = async function (email) {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();

  // 1. Check in Database table
  const found = await this.findOne({ email: normalized });
  if (found) return true;

  // 2. Check in Environment variable or system default
  const envAdmins = (
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_EMAILS ||
    "harshit107.in.2022@gmail.com"
  )
    .toLowerCase()
    .split(",")
    .map((e) => e.trim());

  if (envAdmins.includes(normalized)) {
    // Auto-seed into MongoDB for persistence
    await this.findOneAndUpdate(
      { email: normalized },
      { email: normalized, role: "superadmin", addedBy: "system_init" },
      { upsert: true, new: true }
    ).catch(() => {});
    return true;
  }

  return false;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
