import { NextFunction, Response } from "express";
import { Between } from "typeorm";

import { TypedRequest } from "../../..";
import { UserRole } from "../../dtos/auth.dto";
import { getXMonthsBack } from "../../utils/dates";
import { AppError } from "../../utils/httpError";
import { EventService } from "../services/event.service";
import { TicketService } from "../services/ticket.service";

export class StatsController {
  private eventService: EventService;
  private ticketService: TicketService;

  constructor() {
    this.eventService = new EventService();
    this.ticketService = new TicketService();
  }

  boughtTickets = async (
    req: TypedRequest<{ id: string }, any, any, { start_date?: string; end_date: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ticketDetails = await this.ticketService.findAll({
        findFields: {
          eventId: req.params.id,
          createdAt: Between(
            req.query.start_date ? new Date(req.query.start_date) : getXMonthsBack(1),
            req.query.end_date && req.query.start_date ? new Date(req.query?.end_date) : new Date(),
          ),
        },
        relations: {
          event: true,

          boughtBy: {
            auth: true,
          },
        },
        select: {
          id: true,
          checkedIn: true,
          type: {
            id: true,
            name: true,
            count: true,
            price: true,
            description: true,
          },
          boughtBy: {
            id: true,
            name: true,
            phone: true,
            dob: true,
            auth: {
              email: true,
            },
          },
          event: {
            id: true,
            userId: true,
          },
        },
      });

      if (
        ticketDetails[1] &&
        ticketDetails[0][0].event?.userId !== req.auth.user?.id &&
        req.auth.role !== UserRole.SUPERADMIN
      ) {
        return next(new AppError("Not Authorized", 401));
      }
      res.status(200).json(ticketDetails);
    } catch (e) {
      return next(e);
    }
  };

  timelyStats = async (
    req: TypedRequest<any, any, any, { start_date?: string; end_date?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const findFields = {
      createdAt: Between(
        req.query.start_date ? new Date(req.query.start_date) : getXMonthsBack(1),
        req.query.end_date && req.query.end_date ? new Date(req.query?.end_date) : new Date(),
      ),
      ...(req.auth.role !== UserRole?.SUPERADMIN && {
        event: {
          userId: req.auth.user.id,
        },
      }),
    };
    try {
      const ticketDetails = await this.ticketService.findAll({
        findFields,
        relations: {
          event: true,
          boughtBy: {
            auth: true,
          },
        },
        select: {
          id: true,
          checkedIn: true,
          type: {
            id: true,
            name: true,
            count: true,
            price: true,
            description: true,
          },
          boughtBy: {
            id: true,
            name: true,
            phone: true,
            dob: true,
            auth: {
              email: true,
            },
          },
          event: {
            id: true,
            title: true,
            description: true,
          },
        },
      });

      res.status(200).json(ticketDetails);
    } catch (e) {
      return next(e);
    }
  };
}
