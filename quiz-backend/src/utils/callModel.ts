import { ensureConfiguration } from "@/ai/agent/config";
import { RunnableConfig } from "@langchain/core/runnables";
import { MessagesAnnotation } from "@langchain/langgraph";
import { tools } from "@/ai/agent/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { QuizState } from "@/ai/agent/Graph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const genAI = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI!,
});
export async function callModel(
  state: typeof QuizState.State,
  config: RunnableConfig
): Promise<typeof MessagesAnnotation.Update> {
  const configuration = ensureConfiguration(config);
  const model = genAI.bindTools(tools);

  const systemPrompt = `
You are an AI assistant for quiz generation.
Task:
- Determine if a tool call is needed for the user's query.
- If a tool call is needed, return the AiMessage with the tool call also all the details are given to the tools already so you to just call the tool 
- If no tool is needed, respond only with "no tool needed".
-Never forget the tasks otherwise the quiz will be cancelled which is bad.
`;

  const userQuery = state.input.query ?? "";
  console.log("[callModel] User query:", userQuery);

  const userMessage = new HumanMessage(
    `User query: ${userQuery}\nReturn a minimal quiz draft in JSON only.`
  );

  const messages = [
    new SystemMessage(systemPrompt),
    userMessage,
    ...state.messages,
  ];

  console.log("[callModel] Messages sent to model:", messages);

  const response = await model.invoke(messages);
  console.log("[callModel] Raw model response:", response);

  return { messages: [response] };
}
