import { NextFunction, Response } from "express";

import { TypedRequest } from "../../..";
import { Auth } from "../../database/entity/Auth";
import { Company } from "../../database/entity/Company";
import {
  AuthRegisterCompanyType,
  AuthRegisterDTO1,
  AuthRegisterDTO3,
  AuthRegisterDTOType,
  UserRole,
} from "../../dtos/auth.dto";
import { customValidator } from "../../utils/validators";
import { AuthService } from "../services/auth.service";
import { CompanyService } from "../services/company.service";

export class CompanyController {
  private service: CompanyService;
  constructor() {
    this.service = new CompanyService();
  }
  post = async (
    req: TypedRequest<unknown, unknown, AuthRegisterCompanyType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = await customValidator(AuthRegisterDTO3, {
        ...req.body,
        company_docs: (req.files as Record<string, any>[])?.map((file) => file.filename),
      });
      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      }
      const company = new Company();
      company.description = req.body.description || "";
      company.phone = req.body.phone;
      company.registrationDate = req.body.registrationDate;
      company.registrationNo = req.body.registrationNo;
      company.PAN = req.body.PAN;
      company.name = req.body.name;
      company.user = req.auth?.user;
      company.company_docs = (req.files as Record<string, any>[])?.map((file) => file.filename);
      await this.service.save(company);
      res.status(200).json("Saved Company");
    } catch (e) {
      return next(e);
    }
  };

  add_sub_user = async (
    req: TypedRequest<unknown, unknown, AuthRegisterDTOType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = await customValidator(AuthRegisterDTO1, req.body);
      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      }
      const newAuth = new Auth();
      newAuth.user = req.auth?.user;
      newAuth.email = req.body.email;
      newAuth.userName = req.body.userName;
      newAuth.password = req.body.password;
      newAuth.role = UserRole.COMPANY;
      await new AuthService().save(newAuth);
      res.status(200).json("Added new User");
    } catch (e) {
      return next(e);
    }
  };
}
