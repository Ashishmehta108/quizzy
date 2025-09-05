import { searchWeb } from "./tools/websearch.tool";
import { notionRetriever } from "./tools/notion";
import { QuizState } from "./Graph";
import { ApiError } from "../../utils/apiError";
import { RunnableConfig } from "@langchain/core/runnables";

export async function CollectKnowledge(
  state: typeof QuizState.State,
  config?: RunnableConfig
): Promise<Partial<typeof QuizState.State>> {
  try {
    console.log("[CollectKnowledge] State received:", state, config);

    const queries = [state.input.title, state.context].filter(
      (q): q is string => typeof q === "string" && q.trim().length > 0
    );

    if (!queries.length) {
      console.warn("[CollectKnowledge] No queries found from state input.");
      return { context: "", summary: state.summary ?? "" };
    }

    console.log(
      "[CollectKnowledge] Running web and notion retrieval for queries:",
      queries
    );

    const [webResults, notionResults] = await Promise.all([
      config?.configurable?.websearchOn ? searchWeb(queries.join(" ")) : [],
      config?.configurable?.notionSearchon
        ? notionRetriever(config?.configurable?.userId ?? "", queries)
        : [],
    ]);

    const knowledgeChunks = [...(webResults ?? []), ...(notionResults ?? [])];

    if (!knowledgeChunks.length) {
      console.warn("[CollectKnowledge] No knowledge chunks retrieved.");
      return { context: "", summary: state.summary ?? "" };
    }

    console.log(
      "[CollectKnowledge] Retrieved knowledge chunks:",
      knowledgeChunks
    );

    let summary;
    try {
      summary = state.summary + JSON.parse(knowledgeChunks.join("\n\n"));
    } catch (e: any) {
      console.error(
        "[CollectKnowledge] Failed to parse summary JSON:",
        e.message
      );
      throw new ApiError(500, "Failed to parse knowledge chunks into summary.");
    }

    return {
      context: knowledgeChunks.join("\n\n"),
      summary,
    };
  } catch (err: any) {
    console.error("[CollectKnowledge] Error:", err);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `CollectKnowledge failed: ${err.message || err}`);
  }
}
