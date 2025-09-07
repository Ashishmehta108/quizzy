import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { QuizState } from "./Graph";
import { quizGeneratorNode, retrieveNode } from "./tools";
import { CollectKnowledge } from "./knowledge";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";
import { tools } from "./tools/tool";
import { tool } from "@langchain/core/tools";
import { searchWeb } from "./tools/websearch.tool";
import { notionRetriever } from "./tools/notion";
import { callModel } from "../../utils/callModel";
import { RunnableConfig } from "@langchain/core/runnables";
type State = typeof QuizState.State;

function routeModelOutput(
  state: typeof QuizState.State,
  config: RunnableConfig
): string {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    console.log("tool call found");
    state.usage.webSearchesDone = state.usage.webSearchesDone + 1;
    if (config.configurable?.websearchOn) {
      return "tools";
    }
  } else {
    return "generateQuiz";
  }
  return "generateQuiz";
}

export const searchWebTool = tool(
  async ({ input }: { input: string }) => searchWeb(input),
  {
    name: "searchWeb",
    description:
      "Performs a web search given a query string if websearchOn variable is true.",
  }
);

export const notionSearchtool = tool(
  async ({ userId, queries }: { userId: string; queries: string[] }) =>
    notionRetriever(userId, queries),
  {
    name: "searchNotion",
    description:
      "searches through notion docs if notionsearchOn variable  is set true",
  }
);
const workflow = new StateGraph(QuizState)
  .addNode("retrieve", retrieveNode)
  .addNode("tools", new ToolNode(tools))
  .addNode("callModel", callModel)
  .addNode("generateQuiz", quizGeneratorNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "callModel")
  .addConditionalEdges("callModel", routeModelOutput)
  .addEdge("tools", "callModel")
  .addEdge("generateQuiz", END);

export const airaAgent = workflow.compile({
  name: "Aira Agent",
  description:
    "An agent that generates quizzes based on user input and context with the most recent data.",
});
