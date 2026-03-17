import { Router } from "express";
import { 
  getPricingPlans, 
  getCurrentPlan, 
  checkUpgrade,
  createCheckoutSession
} from "../controllers/pricing.controller";

const router = Router();

// Used interchangeably since pricing controller handles upgrades
router.get("/pricing", getPricingPlans);
router.get("/pricing/current", getCurrentPlan);
router.get("/pricing/trigger", checkUpgrade);
router.post("/pricing/checkout", createCheckoutSession);

export default router;
