import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { QuizQuestion, GenerateQuizQuestionsParams } from "@/types/utils/ai";

export const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI! });

export const generateQuizQuestions = async ({
  title,
  context,
  morecontext,
}: GenerateQuizQuestionsParams): Promise<QuizQuestion[]> => {
  const prompt = `

You are an expert quiz generator.
The title of quiz is ${title}
If the quiz is a technical quiz then only create the quiz with the most recent information about the topic.
Using ONLY the following context, create a quiz: " with title as ${title} and more details of the quiz ${context} ".

Extra Context:
${morecontext || "No additional context provided."}

Output:
- Return ONLY a valid JSON array (no markdown, no extra text)
- Each object should have: 
  - "question": string
  - "options": array of 4 strings
  - "answer":index number of the answer
  - "explanation": string this is explanation of the question's answer make it such that even beginner can understand it and its brief.

  If user tells nothing about the number of questions then make atleast 10 otherwise listen tot what user says 
Example:
[
  {
    "question": "What is 2+2?",
    "options": ["1", "2", "3", "4"],
    "answer": 3 ,
    explanation: "2+2=4"
  }
]

just give response in json not in markdown format 

`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let text =
    result.candidates?.[0]?.content?.parts?.[0]?.text || result.text || "";

  const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", e, "\nRaw text:", text);
    return [];
  }
};
