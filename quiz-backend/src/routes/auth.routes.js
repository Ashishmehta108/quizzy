import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, async (req, res) => {
	res.json({
		user: req.user,
		token: req.user.accessToken
	})
})
export default router;
