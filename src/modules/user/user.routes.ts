import express, { Request, Response } from "express";
import { userControllers } from "./user.controller";
import logger from "../../middleware/logger";
import auth from "../../middleware/auth";

const router = express.Router();

// app.use("/users", userRooutes)

// routes -> controller -> service

router.post("/", userControllers.createUser);

router.get("/", logger, auth("admin"), userControllers.getUser);

router.get("/:id", auth("admin", "customer"), userControllers.getSingleUser);

router.put("/:id", auth("admin", "customer"), userControllers.updateUser);

router.delete("/:id", auth("admin"), userControllers.deleteUser);

export const userRoutes = router;
