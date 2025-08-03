import { and, eq } from "drizzle-orm";
import { db } from "../config/db/index.js";
import { results, questions } from "../config/db/schema.js";

export const calculateResult = async (resultId, userId, quizId) => {
    try {
        // 1. Get the result entry
        console.log(resultId, userId, quizId)
        const [resultRow] = await db
            .select()
            .from(results)
            .where(
                and(
                    eq(results.id, resultId),
                    eq(results.quizId, quizId),
                    eq(results.userId, userId)
                )
            );
        console.log(resultRow)
        if (!resultRow) throw new Error("Result not found or unauthorized");

        let selectedAnswers;
        try {
            selectedAnswers = JSON.parse(resultRow.optionsReview);
        } catch (err) {
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
            if (answerSet.includes(q.answer)) {
                correctCount++;
            }
        });

        const percentage = (correctCount / totalQuestions) * 100;

        await db.update(results)
            .set({ score: correctCount })
            .where(eq(results.id, resultId));
        console.log({
            score: correctCount,
            percentage: percentage.toFixed(2),
            totalQuestions,
            selectedAnswers: questionsData.map((q, index) => ({
                question: q.question,
                selected: selectedAnswers[index] || [],
                correct: q.answer
            }))
        })
        return {
            score: correctCount,
            percentage: percentage.toFixed(2),
            totalQuestions,
            selectedAnswers: questionsData.map((q, index) => ({
                question: q.question,
                selected: selectedAnswers[index] || [],
                correct: q.answer
            }))
        };
    } catch (error) {
        console.error("Error calculating result:", error);
        throw error;
    }
};
