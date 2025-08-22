const fetch = require("node-fetch"); // npm install node-fetch@2

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

//  Helper: Skill Gap Analysis
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
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// API 1: Skill Gap
const analyzeSkillGap = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;
    const gap = await getSkillGapFromModel(targetRole, currentSkills);

    res.json({
      gapAnalysis: gap || "No response from model",
    });
  } catch (err) {
    console.error("Skill gap error:", err);
    res.status(500).json({ error: "Failed to analyze skill gap" });
  }
};

//  API 2: Roadmap (auto-fetches skill gap)
const generateRoadmap = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;

    // Step 1: Internally get skill gap
    const skillGap = await getSkillGapFromModel(targetRole, currentSkills);

    // Step 2: Generate roadmap using that skill gap
    const roadmapPrompt = `
      Create a detailed, step-by-step learning roadmap for becoming a ${targetRole}.
      The roadmap should be based on the following skill gap:
      ${skillGap}

      - Present the roadmap as a numbered list with clear steps.
      - Include timelines (in weeks) and recommended resources for each step.
      - Avoid any introduction — start directly with Step 1.
    `;

    const roadmapResponse = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: roadmapPrompt }] }],
        }),
      }
    );

    const roadmapData = await roadmapResponse.json();

    res.json({
      roadmap:
        roadmapData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from model",
    });
  } catch (err) {
    console.error("Roadmap error:", err);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
};

module.exports = {
  analyzeSkillGap,
  generateRoadmap,
};
