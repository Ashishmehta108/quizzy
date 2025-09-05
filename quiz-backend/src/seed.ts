import { randomUUID } from "crypto";
import {
  users,
  quizzes,
  questions,
  results,
  billings,
  plans,
} from "./config/db/schema";
import { db } from "./config/db";
import { eq } from "drizzle-orm";

function randomDateInLast30Days() {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date;
}

async function seed() {
  const userId = randomUUID();
  const quizId = randomUUID();
  const questionId = randomUUID();
  const billingId = randomUUID();

  // Delete existing dummy user
  await db.delete(users).where(eq(users.email, "john@example.com"));

  // Insert user
  await db.insert(users).values({
    id: userId,
    clerkId: "user_" + randomUUID(),
    name: "John Doe",
    email: "john@example.com",
    role: "user",
  });

  // Fetch Free plan
  const freePlan = await db
    .select()
    .from(plans)
    .where(eq(plans.name, "Free"))
    .limit(1);
  if (freePlan.length === 0) throw new Error("Free plan does not exist.");
  const freePlanId = freePlan[0].id;

  // Insert billing
  await db.insert(billings).values({
    id: billingId,
    userId: userId,
    planId: freePlanId,
    status: "active",
  });

  // Insert quiz
  await db.insert(quizzes).values({
    id: quizId,
    title: "JavaScript Basics",
    userId: userId,
    submitted: false,
  });

  // Insert question
  await db.insert(questions).values({
    id: questionId,
    quizId: quizId,
    question: "What is a closure in JavaScript?",
    options: JSON.stringify([
      "A variable inside a function",
      "A function inside a function",
      "A global object",
      "An object constructor",
    ]),
    answer: 1,
    explanation:
      "A closure is a function that retains access to variables from its outer scope.",
  });

  // Create multiple dummy results to simulate activity over last 30 days
  const dummyResults = Array.from({ length: 15 }, (_, i) => {
    const resultId = randomUUID();
    const submittedAt = randomDateInLast30Days();
    const optionsReview = {
      Q1: {
        selected: Math.floor(Math.random() * 4),
        correct: Math.random() > 0.5,
      },
      Q2: {
        selected: Math.floor(Math.random() * 4),
        correct: Math.random() > 0.5,
      },
      Q3: {
        selected: Math.floor(Math.random() * 4),
        correct: Math.random() > 0.5,
      },
      Q4: {
        selected: Math.floor(Math.random() * 4),
        correct: Math.random() > 0.5,
      },
    };
    const score = Math.floor(Math.random() * 11); // 0-10
    return {
      id: resultId,
      userId: userId,
      quizId: quizId,
      score,
      optionsReview: JSON.stringify(optionsReview),
      submittedAt,
    };
  });

  // Insert dummy results
  for (const r of dummyResults) {
    await db.insert(results).values(r);
  }

  console.log("✅ Seed data with dummy activity inserted!");
  console.log("User ID:", userId);
  console.log("Billing ID:", billingId);
  console.log("Quiz ID:", quizId);
  console.log("Question ID:", questionId);
  console.log("Inserted results count:", dummyResults.length);
}

seed().catch((err) => {
  console.error("❌ Error seeding data:", err);
  process.exit(1);
});
