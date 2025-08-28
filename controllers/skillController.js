const User = require("../models/user");
const Roadmap = require("../models/roadmap");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// 🔹 Helper: Skill Gap Analysis
const getSkillGapFromModel = async (targetRole, currentSkills) => {
  const prompt = `
Analyze the skill gap for someone aiming to become a ${targetRole}.
Current skills: ${currentSkills.join(", ")}.
List ONLY the missing skills and suggest learning priorities.
🔹 Give the answer in a clear, concise bullet-point format.
🔹 Start directly with the list of missing skills — no introduction, no extra sentences.
`;

  const response = await fetch(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
};

// 🔹 Helper: Roadmap Generation (with bulletproof parsing)
const getRoadmapFromModel = async (targetRole, skillGap) => {
  const prompt = `
Create a **comprehensive and detailed learning roadmap** for becoming a ${targetRole}.
Base it on the following skill gap:
${skillGap}

✅ Important instructions:
- Respond ONLY with valid JSON (no backticks, no markdown, no explanation).
- Include at least 6-8 steps (phases).
- Each step should have:
  - "title": short clear name
  - "duration": realistic time estimate (e.g. "2-4 weeks")
  - "topics": a detailed list of subtopics (minimum 4–6 items)
  - "resources": at least 3 high-quality resources (courses, books, articles, videos)
  - "projects": at least 1–2 practical projects per step
  - "status": default as "pending"

Format strictly like this:

{
  "steps": [
    {
      "title": "Step Title",
      "duration": "2-3 weeks",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "resources": ["Resource 1", "Resource 2", "Resource 3"],
      "projects": ["Project 1"],
      "status": "pending"
    }
  ]
}
`;


  const response = await fetch(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  // 🛠 Clean rawText before parsing
  rawText = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error("❌ Roadmap JSON parse failed:", err);

    // Fallback: extract first valid JSON block using regex and sanitize
    const match = rawText.match(/\{[\s\S]*\}/);
    try {
      const cleaned = match?.[0]
        ?.replace(/'/g, '"') // convert single quotes to double quotes
        ?.replace(/,\s*}/g, "}") // remove trailing commas in objects
        ?.replace(/,\s*]/g, "]"); // remove trailing commas in arrays

      parsed = cleaned ? JSON.parse(cleaned) : { steps: [] };
    } catch (fallbackErr) {
      console.error("❌ Fallback parse also failed:", fallbackErr);
      parsed = { steps: [] };
    }
  }

  return { steps: parsed.steps || [], rawText };
};

// 🔹 API 1: Skill Gap Analysis
const analyzeSkillGap = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;

    if (!targetRole || !Array.isArray(currentSkills)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const gap = await getSkillGapFromModel(targetRole, currentSkills);

    res.json({
      gapAnalysis: gap || "No response from model",
    });
  } catch (err) {
    console.error("❌ Skill gap error:", err);
    res.status(500).json({ error: "Failed to analyze skill gap" });
  }
};

// 🔹 API 2: Roadmap Creation
const generateRoadmap = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;
    const userId = req.user?._id;

    if (!userId || !targetRole || !Array.isArray(currentSkills)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Step 1: Get skill gap
    const skillGap = await getSkillGapFromModel(targetRole, currentSkills);

    // Step 2: Get roadmap steps
    const { steps, rawText } = await getRoadmapFromModel(targetRole, skillGap);

    // Step 3: Save roadmap
    const roadmap = new Roadmap({
      userId,
      targetRole,
      currentSkills,
      skillGap,
      steps,
      rawText,
    });

    await roadmap.save();

    // Step 4: Link roadmap to user
    await User.findByIdAndUpdate(userId, {
      $push: { roadmaps: roadmap._id },
    });

    res.status(201).json({ success: true, roadmap });
  } catch (err) {
    console.error("❌ Roadmap creation error:", err);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
};

module.exports = {
  analyzeSkillGap,
  generateRoadmap,
};
