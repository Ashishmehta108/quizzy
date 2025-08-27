// import { interrupt } from "@langchain/langgraph";
// import { QuizState } from "./Graph";

// function humanNode(state: typeof QuizState.State) {
//   const value = interrupt({
//     query: state.input.query,
//   });
//   return {
//     query: value.resume as string,
//   };
// }

// const graph = workflow.compile({
//   checkpointer,
// });

// const threadConfig = { configurable: { thread_id: "some_id" } };
// await graph.invoke(someInput, threadConfig);

// const valueFromHuman = "...";

// await graph.invoke(new Command({ resume: valueFromHuman }), threadConfig);
