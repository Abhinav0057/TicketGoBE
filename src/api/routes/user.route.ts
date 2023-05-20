import { Request, Response, Router } from "express";

import { UserRole } from "../../dtos/auth.dto";
import { hasRole } from "../../infrastructure/middleware/Auth/hasRole.middleware";
import { UserController } from "../controller/user.controller";

const router = Router();
const userController = new UserController();
router.get("/", userController.get);
router.get("/all", hasRole([UserRole.SUPERADMIN]), userController.getAll);
router.get("/add-preferences", userController.add_preferences);
router.get("/my-tickets", userController.get_my_tickets);
router.post("/", userController.post);
router.post("/follow/:id", userController.follow_user);
router.get("/followed", userController.get_followed);

router.get("/update-subscriptions", userController.update_subscription);

export default router;
