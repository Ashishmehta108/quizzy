import { and, eq } from "drizzle-orm";
import { db } from "../config/db/index";
import { results, questions } from "../config/db/schema";

export const calculateResult = async (
  resultId: string,
  userId: string,
  quizId: string
) => {
  try {
    const [resultRow] = await db
      .select()
      .from(results)
      .where(and(eq(results.id, resultId), eq(results.userId, userId)));
    if (!resultRow) {
      throw new Error("Result not found or unauthorized");
    }

    let selectedAnswers;
    try {
      selectedAnswers = JSON.parse(resultRow.optionsReview);
    } catch {
      throw new Error("Invalid JSON in optionsReview");
    }

    const questionsData = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));

    const totalQuestions = questionsData.length;

    let correctCount = 0;
    questionsData.forEach((q, index) => {
      const answerSet = selectedAnswers[index] || [];
      const isCorrect = answerSet.includes(q.answer);
      if (isCorrect) correctCount++;
    });

    const percentage = totalQuestions
      ? (correctCount / totalQuestions) * 100
      : 0;

    await db
      .update(results)
      .set({ score: correctCount })
      .where(eq(results.id, resultId));

    return {
      score: correctCount,
      percentage: percentage.toFixed(2),
      totalQuestions,
      selectedAnswers: questionsData.map((q, index) => ({
        question: q.question,
        selected: selectedAnswers[index] || [],
        correct: q.answer,
        options: JSON.parse(q.options),
        explanation: q.explanation,
        createdAt: q.createdAt,
        submittedAt: q.submittedAt,
      })),
    };
  } catch (error) {
    throw error;
  }
};
