import { Request, Response } from "express";
import { NextFunction } from "express";

import { Auth } from "../../database/entity/Auth";
import { AuthRegisterDTO1, AuthRegisterDTOType, UserRole } from "../../dtos/auth.dto";
import { JWTprovider } from "../../infrastructure/services/Auth/Providers/jwt.provider";
import { HashService } from "../../infrastructure/services/Hash/hash.service";
import { AppError } from "../../utils/httpError";
import { customValidator } from "../../utils/validators";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  register = async (req: Request<unknown, unknown, AuthRegisterDTOType>, res: Response, next: NextFunction) => {
    try {
      const errors = await customValidator(AuthRegisterDTO1, req.body);
      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      } else {
        const newAuth = new Auth();
        newAuth.email = req.body.email;
        newAuth.password = req.body.password;
        newAuth.role = req.body.role;
        newAuth.userName = req.body.userName;
        const auth = await this.service.save(newAuth);
        const token = await this.service.get_token(req.body.password, auth);
        return res.status(200).json({
          message: "Signed Up",
          token,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request<unknown, unknown, { userName: string; password: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const auth = await this.service.findOne({
      findFields: [
        {
          userName: req.body.userName,
        },
        {
          email: req.body.userName,
        },
      ],
      select: {
        password: true,
        role: true,
        id: true,
      },
    });

    if (!auth) {
      return next(new AppError("Invalid Email", 401));
    }
    const token = await this.service.get_token(req.body.password, auth);
    if (token) {
      res.status(200).json({
        message: "Logged In",
        token,
      });
    } else next(new AppError("Invalid Password", 401));
  };
}
