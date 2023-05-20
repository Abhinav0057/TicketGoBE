import axios from "axios";
import { NextFunction, Response } from "express";

import { TypedRequest } from "../../..";
import { KhaltiPaymentDTO, KhaltiRequestInitiatePayload } from "../../dtos/khalti.dto";
import { PaymentService } from "../../infrastructure/services/Payment/payment.service";
import { AppError } from "../../utils/httpError";
import { customValidator } from "../../utils/validators";

export class PaymentController {
  private PaymentService: PaymentService;
  constructor() {
    this.PaymentService = new PaymentService();
  }
  make_payment = async (
    req: TypedRequest<any, any, KhaltiRequestInitiatePayload, any>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = await customValidator(KhaltiPaymentDTO, req.body);

      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      }
      const data = await this.PaymentService.pay(req.body);
      res.status(200).json(data.data);
    } catch (e) {
      return next(e);
    }
  };

  verify_payment = async (req: TypedRequest<any, any, { pidx: string }, any>, res: Response, next: NextFunction) => {
    try {
      if (!req.body.pidx) {
        return next(new AppError("Transaction pidx is required", 400));
      }
      const data = await this.PaymentService.verify(req.body);
      res.status(200).json(data);
    } catch (e) {
      return next(e);
    }
  };
}
