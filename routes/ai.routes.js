// routes/ai.routes.js
const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  analyzeSkillGap,
  generateRoadmap,
} = require("../controllers/skillController");

const router = express.Router();

router.post("/skill-gap", userAuth, analyzeSkillGap);

router.post("/roadmap", userAuth, generateRoadmap);

module.exports = router;
