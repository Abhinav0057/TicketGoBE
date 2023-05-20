import { Request, Response, Router } from "express";

import { fileUpload } from "../../infrastructure/middleware/Application/file-upload.middleware";
import { AuthController } from "../controller/auth.controller";

const router = Router();
const authController = new AuthController();
router.post("/register", fileUpload.array("citi_images", 2), authController.register);
router.post("/login", authController.login);

export default router;
