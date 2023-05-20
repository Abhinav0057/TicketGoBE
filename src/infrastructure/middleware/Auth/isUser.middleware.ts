import { NextFunction, Request, Response } from "express";

import { TypedRequest } from "../../../..";
import { AuthService } from "../../../api/services/auth.service";
import { CompanyService } from "../../../api/services/company.service";
import { UserService } from "../../../api/services/user.service";
import { UserRole } from "../../../dtos/auth.dto";
import { AppError } from "../../../utils/httpError";
import { AuthProviderService } from "../../services/Auth/auth.service";

const authProviderService = new AuthProviderService();

const cleanURL = (url: string) => {
  if (url.charAt(url.length - 1) === "/") {
    return url.substring(0, url.length - 1);
  }
  return url;
};

const byPassNoUser = [
  {
    methods: ["POST", "GET"],
    url: "/apiV1/user",
  },
];

export const isUser = async (req: TypedRequest<any, any, any, any>, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.session;
  try {
    if (token) {
      const payload = authProviderService.compare(token);
      const authService = new AuthService();

      const auth = await authService.findOne({
        findFields: {
          id: payload.id,
        },
        relations: {
          user: true,
        },
      });
      if (!auth) {
        return next(new AppError("Not Valid Token", 400));
      } else if (
        auth.role !== UserRole.SUPERADMIN &&
        !auth.user?.id &&
        !byPassNoUser.find((byP) => byP.methods.includes(req.method) && byP.url === cleanURL(req.originalUrl))
      ) {
        return next(new AppError("You have not completed your signup process", 401));
      } else {
        req.auth = auth;
      }
      next();
    } else {
      return next(new AppError("Not Authorized", 401));
    }
  } catch (e) {
    return next(new AppError("Something Went Wrong", 500));
  }
};
