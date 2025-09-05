import { TavilySearch, TavilySearchResponse } from "@langchain/tavily";
import "dotenv/config";

export const search = new TavilySearch({
  maxResults: 3,
  tavilyApiKey: process.env.TAVILY_API!,
});

export async function searchWeb(query: string): Promise<string[]> {
  if (!query) return [];

  const results: TavilySearchResponse = await search.invoke({ query });
  const contents = results.results.map((r) => r.content);

  return contents;
}
