const mongoose = require("mongoose");
const MissingSkillSchema = new mongoose.Schema({
  name: String,
  category: {
    type: String,
    enum: ["must-have", "good-to-have", "nice-to-have"],
  },
  why: String,
});
const SkillAssessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    targetRole: String,
    currentSkills: [String],
    missingSkills: [MissingSkillSchema],
    suggestedOrder: [String],
  },
  { timestamps: true }
);
module.exports = mongoose.model("SkillAssessment", SkillAssessmentSchema);
