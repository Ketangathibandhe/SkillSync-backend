const mongoose = require("mongoose");
const RoadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  targetRole: String,
  timePerDayHours: Number,
  phases: [{
    title: String,
    durationWeeks: Number,
    topics: [{
      skill: String,
      objectives: [String],
      resources: [{ title: String, url: String, type: String }]
    }],
    checkpoint: String
  }]
}, { timestamps: true });
module.exports = mongoose.model("Roadmap", RoadmapSchema);
