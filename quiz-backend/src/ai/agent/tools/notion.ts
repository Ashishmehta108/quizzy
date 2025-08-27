// import { Client } from "@notionhq/client";

// const notion = new Client({ auth: process.env.NOTION_API_KEY });

// export async function notionRetriever(
//   userId: string,
//   queries: string[]
// ): Promise<string[]> {
//   if (!queries.length) return [];
//   const response = await notion.search({ query: queries[0] });
//   return response.results.map((page) => page.object);
// }
