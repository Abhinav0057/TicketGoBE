import { Router } from "express";

import { UserRole } from "../../dtos/auth.dto";
import { fileUpload } from "../../infrastructure/middleware/Application/file-upload.middleware";
import { hasRole } from "../../infrastructure/middleware/Auth/hasRole.middleware";
import { isUser } from "../../infrastructure/middleware/Auth/isUser.middleware";
import { CompanyController } from "../controller/company.controller";

const router = Router();
const companyController = new CompanyController();

router.post("/", isUser, hasRole([UserRole.COMPANY]), fileUpload.array("company_docs", 3), companyController.post);
router.post("/sub-user", isUser, hasRole([UserRole.COMPANY]), companyController.add_sub_user);

export default router;
