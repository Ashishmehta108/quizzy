import { randomUUID } from "crypto";
import { questions, quizzes, results, users } from "./config/db/schema.js";
import {  db } from "./config/db/index.js"

async function seed() {
    // await client.connect();

    const userId = randomUUID();
    await db.insert(users).values({
        id: userId,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword123"
    });

    const quizId = randomUUID();
    await db.insert(quizzes).values({
        id: quizId,
        title: "JavaScript Basics",
        userId: userId
    });

    const questionId = randomUUID();
    await db.insert(questions).values({
        id: questionId,
        quizId: quizId,
        question: "What is a closure in JavaScript?",
        options: JSON.stringify([
            "A variable inside a function",
            "A function inside a function",
            "A global object"
        ]),
        answer: 1
    });

    await db.insert(results).values({
        id: randomUUID(),
        userId: userId,
        quizId: quizId,
        score: 10
    });

    // await db.insert(test).values({
    //     text: "Just a test row"
    // });

    console.log("Seed data inserted!");
    // await client.end();
}

seed();
