/**
 * @layer service
 * @owner agent-3
 * @tables quizzes, questions, documents
 */
import { QuizRepository } from "../repositories/quiz.repository";
import { checkEntitlement } from "./entitlements.service";
import { airaAgent } from "../ai/agent/airaAgent";
import { randomUUID } from "node:crypto";

const quizRepo = new QuizRepository();

export class QuizGenerationService {
  async generateQuizFromLibrary(workspaceId: string, userId: string, data: { title: string; docIds: string[]; query: string; webSearch?: boolean }) {
    const entitlement = await checkEntitlement(workspaceId, "ai_generation");
    if (!entitlement.allowed) {
      throw new Error(`Limit reached: ${entitlement.limit} AI generations allowed.`);
    }

    // Call AiraAgent with citation requirements
    const aira = await airaAgent.invoke(
      { 
        input: { title: data.title, query: data.query }, 
        usage: { webSearchesDone: 0 } 
      },
      {
        configurable: {
          userId,
          docIds: data.docIds,
          websearchOn: !!data.webSearch,
          // Instruct agent to provide citations
        },
      }
    );

    const { quiz: quizQuestions } = aira;
    
    // Create Quiz
    const quizId = randomUUID();
    const quiz = await quizRepo.createQuiz({
      id: quizId,
      workspaceId,
      title: data.title,
      userId,
      sourceType: "ai",
      submitted: false,
    });

    // Create Questions with Citations
    const questionsData = quizQuestions.map((q: any) => ({
      id: randomUUID(),
      quizId,
      question: q.question,
      options: q.options, // now jsonb
      answer: q.answer,
      explanation: q.explanation || "",
      sourceDocumentId: q.sourceDocumentId,
      sourcePage: q.sourcePage,
      sourceExcerpt: q.sourceExcerpt,
    }));

    await quizRepo.createQuestions(questionsData);

    return { quiz, questions: questionsData };
  }
}
