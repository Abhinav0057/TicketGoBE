import { NextFunction, Request, Response } from "express";

import { TypedRequest } from "../../../..";
import { UserRole } from "../../../dtos/auth.dto";
import { AppError } from "../../../utils/httpError";

export const hasRole = (role: UserRole[]) => {
  return async (req: TypedRequest<any, any, any, any>, res: Response, next: NextFunction) => {
    if (role.includes(req.auth?.role)) {
      next();
    } else {
      return next(new AppError("Not Authorized", 401));
    }
  };
};
