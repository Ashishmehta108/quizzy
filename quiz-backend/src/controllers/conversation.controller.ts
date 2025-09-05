// import { Request, Response } from "express";
// import { db } from "@/config/db";
// import { questions } from "@/config/db/schema";
// import { eq } from "drizzle-orm";

// export const getExplanation = async (req: Request, res: Response) => {
//   try {
//     const { questionId } = req.params;

//     const result = await db
//       .select()
//       .from(questions)
//       .where(eq(questions.id, questionId))
//       .limit(1);

//     if (!result.length) {
//       return res.status(404).json({ error: "Question not found" });
//     }

//     return res.json({ explanation: result[0].explanation });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const askFollowUp = async (req: Request, res: Response) => {
//   try {
//     const { questionId, query } = req.body;

//     if (!questionId || !query) {
//       return res
//         .status(400)
//         .json({ error: "questionId and query are required" });
//     }

//     const result = await db
//       .select()
//       .from(questions)
//       .where(eq(questions.id, questionId))
//       .limit(1);

//     if (!result.length) {
//       return res.status(404).json({ error: "Question not found" });
//     }

//     const explanation = result[0].explanation;

//     const aiAnswer = await getAIResponse(query, explanation);

//     return res.json({ answer: aiAnswer });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };
