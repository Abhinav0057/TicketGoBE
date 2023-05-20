import { Request, Response, Router } from "express";

import { UserRole } from "../../dtos/auth.dto";
import { hasRole } from "../../infrastructure/middleware/Auth/hasRole.middleware";
import { isUser } from "../../infrastructure/middleware/Auth/isUser.middleware";
import { CategoryGroupController } from "../controller/categoryGroup.controller";

const router = Router();
const categoryGroupController = new CategoryGroupController();
router.get("/", categoryGroupController.get);

router.post("/", categoryGroupController.post);

router
  .use(isUser, hasRole([UserRole.SUPERADMIN]))
  .route("/:id")
  .get(categoryGroupController.getById)
  .put(categoryGroupController.put)
  .delete(categoryGroupController.delete);

export default router;
