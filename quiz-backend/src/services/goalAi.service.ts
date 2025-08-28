import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI!,
});

export async function generateGoalPlan(rawGoal: string) {
  const prompt = `
User's goal: "${rawGoal}"

You are an AI mentor. Break this goal into:
- A short motivating description
- A JSON array of steps with titles and timelines
Make it actionable and clear.
Return only valid JSON.

Example:
{
  "description": "Learn DP systematically with theory + practice",
  "steps": [
    { "title": "Week 1: Basics of DP", "timeline": "7 days" },
    { "title": "Week 2: Medium Problems", "timeline": "7 days" }
  ]
}
  `;

  const response = await client.models.generateContent({
    model: "gemini-1.5-pro",
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    config: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1000,
      candidateCount: 1,
    },
  });

  if (
    !response.candidates ||
    response.candidates.length === 0 ||
    !response.candidates[0].content ||
    !response.candidates[0].content.parts
  ) {
    throw new Error("No response from AI model");
  }
  const raw = response?.candidates[0]?.content?.parts[0].text;
  return JSON.parse(raw || "{}");
}
