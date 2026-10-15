const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `pk_live_${uuidv4().replace(/-/g, "")}`,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    developers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maintenance: {
      type: Boolean,
      default: false,
    },
    verification: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to format project according to UI expectations
projectSchema.methods.toUiFormat = function () {
  const project = this;
  return {
    api: project.apiKey,
    admin: project.admin ? project.admin.toString() : "",
    name: project.name,
    email: project.email || "",
    maintenance: project.maintenance,
    verification: project.verification,
    developer: (project.developers || []).map((dev) => dev.toString()),
  };
};

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
