import { GoogleGenAI } from "@google/genai";
const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI || "",
});

export async function getAIResponse(query: string, explanation: string) {
  const prompt = `
You are a helpful tutor. 
Here is the explanation of the quiz question: 
"${explanation}"

User's follow-up question: "${query}"

Answer in a clear and simple way, based only on the explanation above.
  `;

  const response = await client.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    config: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1000,
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
  return response?.candidates[0]?.content?.parts[0].text;
}
