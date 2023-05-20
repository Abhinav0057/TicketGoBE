import { Response } from "express";
import { NextFunction } from "express";

import { TypedRequest } from "../../..";
import { Auth } from "../../database/entity/Auth";
import { User } from "../../database/entity/User";
import { AuthRegisterDTO2, AuthRegisterUserType } from "../../dtos/auth.dto";
import { AppError } from "../../utils/httpError";
import { customValidator } from "../../utils/validators";
import { TicketService } from "../services/ticket.service";
import { UserService } from "../services/user.service";

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  get = async (req: TypedRequest<unknown, unknown, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.findOne({
        findFields: {
          auth: {
            id: req.auth.id,
          },
        },
        relations: {
          auth: true,
          company: true,
          preferences: true,
          followingOrganizer: true,
          favoriteEvents: true,
        },
      });
      res.status(200).json(user);
    } catch (e) {
      return next(e);
    }
  };

  getAll = async (
    req: TypedRequest<unknown, unknown, unknown, { page?: number; pageCount?: number }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(200).json(
        await this.service.findAll({
          page: req.query.page,
          pageCount: req.query.pageCount,
        }),
      );
    } catch (e) {
      return next(e);
    }
  };

  update_subscription = async (
    req: TypedRequest<{ isSubscribed?: string }, unknown, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.auth?.user;
      user.subscribed =
        req.params.isSubscribed !== undefined ? (req.params.isSubscribed === "true" ? true : false) : true;
      await this.service.save(user);
      res.status(200).json("Subscribed");
    } catch (e) {
      return next(e);
    }
  };

  add_preferences = async (
    req: TypedRequest<unknown, unknown, { preferences: string[] }, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.auth?.user;
      await this.service.add_preferences(user?.id, req.body.preferences || []);
      res.status(200).json("Subscribed");
    } catch (e) {
      return next(e);
    }
  };

  get_followed = async (
    req: TypedRequest<{ id: string }, unknown, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = await this.service.findOne({
        findFields: {
          id: req.auth.user.id,
        },
        relations: {
          followingOrganizer: {
            company: true,
          },
        },
        select: {
          followingOrganizer: {
            id: true,
            name: true,
            description: true,
            phone: true,
            company: {
              id: true,
              name: true,
              description: true,
              phone: true,
            },
          },
        },
      });
      const map_followingOrganizer = await this.service.remove_user_from_those_who_have_company(
        user.followingOrganizer,
      );
      res.status(200).json({
        followingOrganizer: map_followingOrganizer,
      });
    } catch (e) {
      return next(e);
    }
  };

  follow_user = async (
    req: TypedRequest<{ id: string }, unknown, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.auth.user;
      const userToFollow = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
        relations: {
          company: true,
        },
      });
      if (!userToFollow) {
        return next(new AppError("No Such User or Company to Follow", 400));
      }
      user.followingOrganizer = [...(user.followingOrganizer || []), userToFollow];
      await this.service.save(user);
      res.status(200).json("Followed");
    } catch (e) {
      return next(e);
    }
  };

  post = async (
    req: TypedRequest<unknown, unknown, AuthRegisterUserType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = await customValidator(AuthRegisterDTO2, req.body);
      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      }
      const user = new User();
      user.name = req.body.name;
      user.description = req.body.description || "";
      user.phone = req.body.phone;
      user.dob = req.body.dob;
      user.gender = req.body.gender;
      user.auth = req.auth;
      await this.service.save(user);
      res.status(200).json("Saved User");
    } catch (e) {
      return next(e);
    }
  };

  get_my_tickets = async (
    req: TypedRequest<unknown, unknown, { preferences: string[] }, { page?: number; pageCount?: number }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.auth?.user;
      res.status(200).json(
        await new TicketService().findAll({
          findFields: {
            boughtById: user?.id,
          },
          relations: {
            event: true,
          },
          select: {
            event: {
              id: true,
              title: true,
              isPublished: true,
              startDate: true,
              endDate: true,
            },
          },
          page: req.query.page,
          pageCount: req.query.pageCount,
        }),
      );
    } catch (e) {
      return next(e);
    }
  };
}
