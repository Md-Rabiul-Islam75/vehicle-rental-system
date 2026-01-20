import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// signup and signin
router.post("/signup", authController.signupUser);
router.post("/signin", authController.loginUser);

export const authRoutes = router;
