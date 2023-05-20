import { Router } from "express";

import { PaymentController } from "../controller/payment.controller";

const paymentController = new PaymentController();
const router = Router();
router.post("/khalti-pay", paymentController.make_payment);

export default router;
