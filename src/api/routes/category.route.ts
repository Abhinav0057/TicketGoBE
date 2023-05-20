import { Request, Response, Router } from "express";

import { UserRole } from "../../dtos/auth.dto";
import { hasRole } from "../../infrastructure/middleware/Auth/hasRole.middleware";
import { isUser } from "../../infrastructure/middleware/Auth/isUser.middleware";
import { CategoryController } from "../controller/category.controller";

const router = Router();
const categoryController = new CategoryController();
router.get("/", categoryController.get);
router.post("/", isUser, hasRole([UserRole.SUPERADMIN]), categoryController.post);

router
  .use(isUser, hasRole([UserRole.SUPERADMIN]))
  .route("/:id")
  .get(categoryController.getById)
  .put(categoryController.put)
  .delete(categoryController.delete);

export default router;
