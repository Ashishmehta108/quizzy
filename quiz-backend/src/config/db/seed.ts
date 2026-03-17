/**
 * @layer script
 * @owner agent-1
 */
import { db } from "./index";
import { plans } from "./schema";

async function seed() {
  console.log("Seeding plans...");
  
  const planData = [
    {
      name: "Free",
      description: "Get started for free",
      price: "0",
      currency: "INR",
      interval: "monthly",
      maxCourses: 1,
      maxCohorts: 1,
      maxMaterialPages: 50,
      maxAssignmentsPerMonth: 1,
      maxAttemptsPerMonth: 30,
      maxInstructorSeats: 1,
      maxStudentSeats: 25,
      maxAiGenerations: 5,
      maxWebsearches: 10,
      exportTypes: ["none"],
      analyticsLevel: "basic",
    },
    {
      name: "Educator Pro",
      description: "Everything you need to teach like a pro",
      price: "999",
      currency: "INR",
      interval: "monthly",
      maxCourses: 10,
      maxCohorts: 10,
      maxMaterialPages: 500,
      maxAssignmentsPerMonth: 50,
      maxAttemptsPerMonth: 1000,
      maxInstructorSeats: 3,
      maxStudentSeats: 200,
      maxAiGenerations: 100,
      maxWebsearches: 200,
      exportTypes: ["csv", "pdf"],
      analyticsLevel: "full",
    },
  ];

  for (const plan of planData) {
    await db.insert(plans).values(plan).onConflictDoUpdate({
      target: plans.name,
      set: plan,
    });
  }

  console.log("Seeding complete ✅");
}

seed().catch(console.error);
