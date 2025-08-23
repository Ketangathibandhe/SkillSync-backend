const mongoose = require("mongoose");

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  currentSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: String,
    required: true,
  },
  roadmap: [
    {
      skill: String,
      description: String,
      resources: [String],
      status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending",
      },
    },
  ],
  progress: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Roadmap", RoadmapSchema);