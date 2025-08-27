import { TavilySearch, TavilySearchResponse } from "@langchain/tavily";
import "dotenv/config";

const search = new TavilySearch({
  maxResults: 3,
  tavilyApiKey: process.env.TAVILY_API!,
});

export async function searchWeb(query: string): Promise<string[]> {
  if (!query) {
    console.warn("[SearchWeb] Empty query received.");
    return [];
  }

  console.log("[SearchWeb] Performing web search for query:", query);
  const results: TavilySearchResponse = await search.invoke({ query });
  console.log("[SearchWeb] Results:", results);

  return results.results.map((r) => r.content);
}
