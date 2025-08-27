import { randomUUID } from "crypto";
import { questions, quizzes, results, users } from "./config/db/schema";
import { db } from "./config/db";

async function seed() {
  const userId = randomUUID();
  await db.insert(users).values({
    id: userId,
    clerkId: "user_" + randomUUID(), // since clerkId is required & unique
    name: "John Doe",
    email: "john@example.com",
    role: "user",
  });

  const quizId = randomUUID();
  await db.insert(quizzes).values({
    id: quizId,
    title: "JavaScript Basics",
    userId: userId,
    submitted: false,
  });

  const questionId = randomUUID();
  await db.insert(questions).values({
    id: questionId,
    quizId: quizId,
    question: "What is a closure in JavaScript?",
    options: JSON.stringify([
      "A variable inside a function",
      "A function inside a function",
      "A global object",
    ]),
    answer: 1,
    explanation:
      "A closure is a function that retains access to variables from its outer scope.",
  });

  await db.insert(results).values({
    id: randomUUID(),
    userId: userId,
    quizId: quizId,
    score: 10,
    optionsReview: JSON.stringify({
      Q1: { selected: 1, correct: true },
    }),
  });

  console.log("✅ Seed data inserted!");
}

seed().catch((err) => {
  console.error("❌ Error seeding data:", err);
  process.exit(1);
});
