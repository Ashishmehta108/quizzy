import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Generates a relevant quiz topic/query based on uploaded document text.
 * @param {string} documentText - The full text extracted from the PDF or document.
 * @returns {Promise<string>} - A short, relevant query or topic.
 */
export async function generateRelevantQuery(documentText) {
    try {
        console.log(documentText)
        const prompt = `
A user uploaded the following document but did not provide a clear query.
Read the content and generate a short, relevant topic or question that could be used to create a quiz also the document might contain code so understand the code and then make the summary.

Document:
${documentText}

Return only the summary in one sentence as i want to pass all the context of the text to the llm in a single string not in any other data type. dont give the result in markdown format
`;

        const response = await openai.chat.completions.create({
            model: "openai/gpt-oss-20b:free",
            messages: [
                {
                    role: "system",
                    content: "You are an assistant that helps generate quiz topics from document content.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        console.log("Relevant query generated:", response.choices[0]?.message?.content?.trim());
        return response.choices[0]?.message?.content?.trim();
    } catch (error) {
        console.error("Failed to generate relevant query:", error);
        return null;
    }
}
