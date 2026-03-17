/**
 * @layer repository
 * @owner agent-3
 * @tables quizzes, questions, courses
 */
import { db } from "../config/db";
import { quizzes, questions } from "../config/db/schema";
import { eq, and } from "drizzle-orm";

export class QuizRepository {
  async createQuiz(data: any) {
    const result = await db.insert(quizzes).values(data).returning();
    return result[0];
  }

  async getQuizById(id: string) {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result[0];
  }

  async listQuizzesByWorkspace(workspaceId: string) {
    return await db.select().from(quizzes).where(eq(quizzes.workspaceId, workspaceId));
  }

  async listQuizzesByCourse(courseId: string) {
    return await db.select().from(quizzes).where(eq(quizzes.courseId, courseId));
  }

  async updateQuiz(id: string, data: any) {
    const result = await db
      .update(quizzes)
      .set(data)
      .where(eq(quizzes.id, id))
      .returning();
    return result[0];
  }

  async deleteQuiz(id: string) {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // Questions
  async createQuestions(data: any[]) {
    return await db.insert(questions).values(data).returning();
  }

  async getQuestionsByQuiz(quizId: string) {
    return await db.select().from(questions).where(eq(questions.quizId, quizId));
  }

  async updateQuestion(id: string, data: any) {
    const result = await db
      .update(questions)
      .set(data)
      .where(eq(questions.id, id))
      .returning();
    return result[0];
  }

  async deleteQuestionsByQuiz(quizId: string) {
    await db.delete(questions).where(eq(questions.quizId, quizId));
  }
}
