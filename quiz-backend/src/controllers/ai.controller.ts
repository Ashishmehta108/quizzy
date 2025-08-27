export const createQuiz = async (title: string, context: string) => {
  return [
    {
      question: "What is the main topic of the quiz?",
      options: ["Math", "Science", "History", "Literature"],
      answer: 2,
      explanation: "The quiz is about History.",
    },
    {
      question: "Who was the first president of the United States?",
      options: [
        "George Washington",
        "Thomas Jefferson",
        "Abraham Lincoln",
        "John Adams",
      ],
      answer: 0,
      explanation:
        "George Washington was the first president of the United States.",
    },
    {
      question: "What year did World War II end?",
      options: ["1945", "1939", "1918", "1963"],
      answer: 0,
      explanation: "World War II ended in 1945.",
    },
  ];
};
