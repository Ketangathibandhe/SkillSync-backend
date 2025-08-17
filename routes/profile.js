const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

profileRouter.post("/set-role", userAuth, async (req, res) => {
  try {
    const { targetRole } = req.body;
    await User.findByIdAndUpdate(req.user._id, { targetRole });
    res.json({ message: "Target role updated!" });
  } catch (error) {
    res.send("something went wrong.." + error.message);
  }
});

profileRouter.post("/add-skills", userAuth, async (req, res) => {
  try {
    const { currentSkills } = req.body; // ["HTML","CSS","JS"]
    await User.findByIdAndUpdate(req.user._id, { currentSkills });
    res.json({ message: "Skills updated!" });
  } catch (error) {
    res.send("something went wrong.." + error.message);
  }
});

module.exports = profileRouter;
