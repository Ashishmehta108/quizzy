import {db} from "./config/db/index"
import { plans } from "./config/db/schema";

async function createPlans() {
  await db.insert(plans).values([
    {
      name: "Free",
      description: "For beginners starting their quiz journey",
      price: "0",
      currency: "INR",
      monthlyLimit: JSON.stringify({
        quizzesGenerated: 30,
        websearches: 10,
      }),
      createdAt: new Date(),
    },
    {
      name: "Chill",
      description: "For serious quiz makers who want more freedom",
      price: "349",
      currency: "INR",
      monthlyLimit: JSON.stringify({
        quizzesGenerated: 300,
        websearches: 100,
      }),
      createdAt: new Date(),
    },
    {
      name: "Chigma",
      description: "Full-featured plan for power users and teams",
      price: "749",
      currency: "INR",
      monthlyLimit: JSON.stringify({
        quizzesGenerated: 1000,
        websearches: 300,
      }),
      createdAt: new Date(),
    },
  ]);
  console.log("Plans created successfully!");
}

createPlans().catch(console.error);
