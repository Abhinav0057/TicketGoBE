import { Router } from "express";

import { isUser } from "../../infrastructure/middleware/Auth/isUser.middleware";
import authRoute from "./auth.route";
import categoryRoute from "./category.route";
import categoryGroupRoute from "./categoryGroup.routes";
import companyRoute from "./company.route";
import eventRoute from "./event.routes";
import paymentRoute from "./payment.route";
import statsRoute from "./stats.routes";
import userRoute from "./user.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/user", isUser, userRoute);
router.use("/category", categoryRoute);
router.use("/event", eventRoute);
router.use("/category-group", categoryGroupRoute);
router.use("/company", isUser, companyRoute);
router.use("/stats", isUser, statsRoute);
router.use("/payment", paymentRoute);

export default router;
