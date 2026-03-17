import { db } from "./config/db/index"
import { plans } from "./config/db/schema";

async function createPlans() {
  await db.insert(plans).values([
    {
      name: "Free",
      description: "For beginners starting their quiz journey",
      price: "0.00",
      currency: "USD",
      maxCourses: 1,
      maxCohorts: 1,
      maxMaterialPages: 50,
      maxAssignmentsPerMonth: 1,
      maxAttemptsPerMonth: 30,
      maxInstructorSeats: 1,
      maxStudentSeats: 25,
      maxAiGenerations: 5,
      maxWebsearches: 10,
      createdAt: new Date(),
    },
    {
      name: "Chill",
      description: "For serious quiz makers who want more freedom",
      price: "15.00",
      currency: "USD",
      maxCourses: 5,
      maxCohorts: 5,
      maxMaterialPages: 200,
      maxAssignmentsPerMonth: 10,
      maxAttemptsPerMonth: 200,
      maxInstructorSeats: 3,
      maxStudentSeats: 100,
      maxAiGenerations: 50,
      maxWebsearches: 50,
      createdAt: new Date(),
    },
    {
      name: "Chigma",
      description: "Full-featured plan for power users and teams",
      price: "49.00",
      currency: "USD",
      maxCourses: 20,
      maxCohorts: 20,
      maxMaterialPages: 1000,
      maxAssignmentsPerMonth: 100,
      maxAttemptsPerMonth: 1000,
      maxInstructorSeats: 10,
      maxStudentSeats: 500,
      maxAiGenerations: 500,
      maxWebsearches: 200,
      createdAt: new Date(),
    },
  ] as any);
  console.log("Plans created successfully!");
}

createPlans().catch(console.error);
