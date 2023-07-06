const mongoose = require("mongoose");

const devloperSchema = new mongoose.Schema(
  {
    developerName: {
      type: String,
      trim: true,
      required: true,
    },
    developerImage: {
      type: String,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const developer = mongoose.model("Developer", devloperSchema);
module.exports = developer;
