// dynamic import to avoid ESM/CJS conflicts
require("dotenv").config();
async function getGeminiModel() {
  const { GoogleGenerativeAI } = await import("@google/genai");
  const client = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const model = client.getGenerativeModel({ model: modelName });
  return model;
}
module.exports = { getGeminiModel };
