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
      console.warn("⚠️ Result not found or unauthorized for:", {
        resultId,
        userId,
      });
      throw new Error("Result not found or unauthorized");
    }

    // 2. Parse selected answers
    let selectedAnswers;
    try {
      selectedAnswers = JSON.parse(resultRow.optionsReview);
     
    } catch (err) {
      console.error(
        "❌ Invalid JSON in optionsReview:",
        resultRow.optionsReview
      );
      throw new Error("Invalid JSON in optionsReview");
    }

    const questionsData = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));

    console.log("📊 Questions fetched:", questionsData.length);

    const totalQuestions = questionsData.length;

    // 4. Compare answers
    let correctCount = 0;
    questionsData.forEach((q, index) => {
      const answerSet = selectedAnswers[index] || [];
      const isCorrect = answerSet.includes(q.answer);

      if (isCorrect) correctCount++;

      console.log(`🔍 Q${index + 1}:`, {
        question: q.question,
        selected: answerSet,
        correct: q.answer,
        isCorrect,
      });
    });

    console.log("✅ Correct answers count:", correctCount);

    // 5. Calculate percentage
    const percentage = totalQuestions
      ? (correctCount / totalQuestions) * 100
      : 0;

    // 6. Update result in DB
    await db
      .update(results)
      .set({ score: correctCount })
      .where(eq(results.id, resultId));

    console.log("💾 Result updated in DB:", {
      id: resultId,
      score: correctCount,
      percentage: percentage.toFixed(2),
    });

    // 7. Build response
    const response = {
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

    console.log("🎉 Final calculated result:", response);

    return response;
  } catch (error) {
    console.error("💥 Error calculating result:", error);
    throw error;
  }
};
