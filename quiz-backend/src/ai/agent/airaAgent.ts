import { StateGraph, START, END } from "@langchain/langgraph";
import { QuizState } from "./Graph";
import { quizGeneratorNode, retrieveNode } from "./tools";
import { CollectKnowledge } from "./knowledge";

type State = typeof QuizState.State;

async function summaryNode(state: State): Promise<Partial<State>> {
  console.log("[SummaryNode] Input state:", state);
  const summary = state.summary;
  console.log("[SummaryNode] Returning summary:", summary);
  return { summary };
}

const workflow = new StateGraph(QuizState)
  .addNode("retrieve", retrieveNode)
  .addNode("quizGenerator", quizGeneratorNode)
  .addNode("Summary", summaryNode)
  .addNode("CollectKnowledge", CollectKnowledge)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "CollectKnowledge")
  .addConditionalEdges("CollectKnowledge", (state) => {
    console.log(
      "[Workflow] ConditionalEdges check for CollectKnowledge. Summary present?",
      !!state.summary
    );
    return state.summary ? "Summary" : "CollectKnowledge";
  })
  .addEdge("Summary", "quizGenerator")
  .addEdge("retrieve", "quizGenerator")
  .addEdge("quizGenerator", END);

export const airaAgent = workflow.compile({
  name: "Aira Agent",
  description:
    "An agent that generates quizzes based on user input and context with the most recent data.",
});
