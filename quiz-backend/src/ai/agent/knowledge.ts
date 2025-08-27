// import { searchWeb } from "./tools/websearch.tool";
// // import { notionRetriever } from "./tools/notion";
// import { QuizState } from "./Graph";

// export async function CollectKnowledge(
//   state: typeof QuizState.State,
//   config?: { configurable?: { userId?: string } }
// ): Promise<Partial<typeof QuizState.State>> {
//   const queries = [state.input.title, state.context].filter(
//     (q): q is string => typeof q === "string"
//   );

//   const [
//     webResults,
//     // , notionResults
//   ] = await Promise.all([
//     searchWeb(queries.join(" ")),
//     // notionRetriever(config?.configurable?.userId ?? "", queries),
//   ]);

//   const knowledgeChunks = [
//     ...(webResults ?? []),
//     // , ...(notionResults ?? [])
//   ];

//   return {
//     context: knowledgeChunks.join("\n\n"),
//   };
// }

import { searchWeb } from "./tools/websearch.tool";
import { QuizState } from "./Graph";

export async function CollectKnowledge(
  state: typeof QuizState.State,
  config?: { configurable?: { userId?: string } }
): Promise<Partial<typeof QuizState.State>> {
  console.log("[CollectKnowledge] State received:", state);

  const queries = [state.input.title, state.context].filter(
    (q): q is string => typeof q === "string"
  );

  console.log("[CollectKnowledge] Queries formed:", queries);

  const [webResults] = await Promise.all([
    searchWeb(queries.join(" ")),
    // notionRetriever(config?.configurable?.userId ?? "", queries),
  ]);

  console.log("[CollectKnowledge] Web results:", webResults);

  const knowledgeChunks = [...(webResults ?? [])];
  console.log("[CollectKnowledge] Knowledge Chunks:", knowledgeChunks);

  return {
    context: knowledgeChunks.join("\n\n"),
  };
}
