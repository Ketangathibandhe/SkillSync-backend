const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  analyzeSkillGap,
  generateRoadmap,
  getRoadmapById, // new controller
} = require("../controllers/skillController");

const router = express.Router();

// Skill Gap Analysis
router.post("/skill-gap", userAuth, analyzeSkillGap);

// Roadmap Generation
router.post("/roadmap", userAuth, generateRoadmap);

// Roadmap Fetch (for /roadmap page refresh)
router.get("/roadmap/:id", userAuth, getRoadmapById);


module.exports = router;