import { StateGraph, START, END } from "@langchain/langgraph";
import { QuizState } from "./Graph";
import { quizGeneratorNode, refineQuizNode, retrieveNode } from "./tools";

const workflow = new StateGraph(QuizState)
  .addNode("retrieve", retrieveNode)
  .addNode("quizGenerator", quizGeneratorNode)
  .addNode("quizRefiner", refineQuizNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "quizGenerator")
  .addEdge("quizGenerator", "quizRefiner")
  .addEdge("quizRefiner", END);

export const airaAgent = workflow.compile();
