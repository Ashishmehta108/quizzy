/**
 * @layer service
 * @owner agent-4
 */
import { AttemptRepository } from "../repositories/attempt.repository";

export const GradingService = {
  async overrideGrade(attemptId: string, overrideScore: number | null, comments: string | null, userId: string) {
    if (overrideScore !== null && (overrideScore < 0 || overrideScore > 100)) {
      throw new Error("Score must be between 0 and 100");
    }
    await AttemptRepository.updateGrade(attemptId, overrideScore, comments, userId);
  }
};
