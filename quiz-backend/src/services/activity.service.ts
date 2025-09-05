export interface Result {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  optionsReview: string;
  submittedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  submitted: boolean;
}
export const processActivityData = (results: Result[]) => {
  if (!results || results.length === 0) return [];

  const resultMap: Record<string, Result[]> = {};
  results.forEach((r) => {
    const dateKey = new Date(r.submittedAt).toISOString().split("T")[0];
    if (!resultMap[dateKey]) resultMap[dateKey] = [];
    resultMap[dateKey].push(r);
  });

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  return last30Days
    .map((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const dayResults = resultMap[dateKey] || [];
      const averageScore =
        dayResults.length > 0
          ? Math.round(
              dayResults.reduce((sum, r) => sum + r.score, 0) /
                dayResults.length
            )
          : 0;
      return {
        date: dateKey,
        name: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        quizzes: dayResults.length,
        score: averageScore,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
      };
    })
    .filter((data) => data.quizzes > 0 || Math.random() < 0.1);
};
