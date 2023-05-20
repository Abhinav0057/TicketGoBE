import { NextFunction, Request, Response } from "express";
import { IsNull, MoreThanOrEqual, Not } from "typeorm";
import { v4 } from "uuid";

import { TypedRequest } from "../../..";
import { Event } from "../../database/entity/Event";
import { UserRole } from "../../dtos/auth.dto";
import { EventRegisterDTO, EventRegisterType, EventSearchType, EventType, TicketType } from "../../dtos/event.dto";
import { KhaltiPaymentDTO, KhaltiRequestInitiatePayload } from "../../dtos/khalti.dto";
import { calculateDelay } from "../../infrastructure/services/Cron/cron.service";
import { QueueAction, queueService } from "../../infrastructure/services/Cron/queue.service";
import { PaymentService } from "../../infrastructure/services/Payment/payment.service";
import { streamUpload } from "../../utils/cloudinary";
import { AppError } from "../../utils/httpError";
import { customValidator } from "../../utils/validators";
import { create_finder_for_venue_date_checker, EventService } from "../services/event.service";
import { TicketService } from "../services/ticket.service";
import { UserService } from "../services/user.service";

export class EventController {
  private service: EventService;
  private ticketService: TicketService;
  private userService: UserService;
  private paymentService: PaymentService;

  constructor() {
    this.service = new EventService();
    this.ticketService = new TicketService();
    this.userService = new UserService();
    this.paymentService = new PaymentService();
  }

  check_in = async (
    req: TypedRequest<{ id: string }, unknown, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ticket = await this.ticketService.findOne({
        findFields: {
          id: req.params.id,
        },
        relations: {
          event: true,
        },
      });
      if (ticket.event.userId !== req.auth?.user?.id) {
        return next(new AppError("Not Authorized", 401));
      }
      if (!ticket) {
        return next(new AppError("Invalid Ticket", 400));
      }
      ticket.checkedIn = new Date();
      await this.ticketService.save(ticket);
      res.status(200).json("Successfully Checked In");
    } catch (e) {
      return next(e);
    }
  };

  verify_booking = async (
    req: TypedRequest<
      { id: string },
      unknown,
      {
        bookDetails: TicketType[];
        paymentId: string;
        transactionId: string;
        tickets: string[];
      },
      unknown
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const eventBooked = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
      });
      if (!eventBooked) {
        return new AppError("No Event Found. Please Contact Provider for Refund if there is a problem", 400);
      }
      const payment_verify_payload = await this.paymentService.verify({ pidx: req.body.paymentId });

      if (!payment_verify_payload) {
        await this.service.rollback_ticket_count_from_ticket_type(eventBooked, req.body.bookDetails);
        await this.ticketService.rollBack_tickets_bought(req.body.tickets);
        return next(new AppError("Invalid Payment Id", 400));
      }
      if (payment_verify_payload.data?.transaction_id !== req.body.transactionId) {
        await this.ticketService.rollBack_tickets_bought(req.body.tickets);
        await this.service.rollback_ticket_count_from_ticket_type(eventBooked, req.body.bookDetails);
        return next(new AppError("Invalid Transaction Id", 400));
      }

      const delayForMailService = calculateDelay(eventBooked.startDate);

      if (delayForMailService) {
        queueService.addToQueue(
          {
            data: {
              event: eventBooked,
              auth: req.auth,
            },
            action: QueueAction.SEND_EVENT_START,
          },
          {
            delay: delayForMailService,
          },
        );
      }
      res.status(200).json("Booked");
    } catch (e) {
      return next(e);
    }
  };

  book = async (
    req: TypedRequest<
      { id: string },
      unknown,
      {
        bookDetails: TicketType[];
        paymentDetails: KhaltiRequestInitiatePayload;
      },
      unknown
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = await customValidator(KhaltiPaymentDTO, req.body.paymentDetails);
      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      }
      if (!req.body.bookDetails?.length) {
        return next(new AppError("Please book a seat", 400));
      }

      const eventToBook = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
      });

      if (!eventToBook) {
        return next(new AppError("No Such Event found", 400));
      }

      await this.service.deduct_ticket_count_from_ticket_type(eventToBook, req.body.bookDetails);

      const tickets = await this.ticketService.insert_tickets_bought(
        req.body.bookDetails,
        req.auth?.user?.id,
        eventToBook.id,
      );
      const { data: paymentResponse } = await this.paymentService.pay(req.body.paymentDetails);

      res.status(200).json({
        paymentResponse,
        tickets: tickets.identifiers.map((ticket) => ticket.id),
      });
    } catch (e) {
      return next(e);
    }
  };

  getUnapproved = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await this.service.findAll({
        findFields: {
          approvedBy: IsNull(),
        },
      });
      res.status(200).json(events);
    } catch (e) {
      return next(e);
    }
  };
  getApproved = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await this.service.findAll({
        findFields: {
          approvedBy: Not(IsNull()),
        },
      });
      res.status(200).json(events);
    } catch (e) {
      return next(e);
    }
  };

  get = async (req: TypedRequest<unknown, unknown, unknown, EventSearchType>, res: Response, next: NextFunction) => {
    if (req.auth && req.auth?.user?.id !== req.query.user && req.auth?.role !== UserRole.SUPERADMIN) {
      return next(new AppError("Not Authorized", 401));
    }
    try {
      const events = await this.service.search_events({
        ...req.query,
        user: req.auth?.user?.id || "",
      });
      res.status(200).json(events);
    } catch (e) {
      return next(e);
    }
  };

  add_to_favorites = async (req: TypedRequest<{ id: string }, any, any, any>, res: Response, next: NextFunction) => {
    try {
      const user = req.auth?.user;
      const event = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
      });
      if (!event) {
        return next(new AppError("No Such Event Found", 400));
      }
      user.favoriteEvents = [...(user.favoriteEvents || []), event];
      await this.userService.save(user);
      res.status(200).json("Added to favorites");
    } catch (e) {
      return next(e);
    }
  };

  getById = async (req: TypedRequest<{ id: string }, any, any, any>, res: Response, next: NextFunction) => {
    try {
      const event = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          ticketTypes: true,
          venue: {
            name: true,
            coordinates: {
              lat: true,
              lng: true,
            },
          },
          startDate: true,
          endDate: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          isPublished: true,
          approvedBy: true,
        },
        relations: {
          categories: true,
          user: true,
        },
      });
      res.status(200).json(event);
    } catch (e) {
      return next(e);
    }
  };

  get_booked_dates_for_venues = async (
    req: TypedRequest<any, any, any, { name: string; lat: string; lng: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(200).json(
        await this.service.findAll({
          findFields: {
            venue: {
              name: req.query.name,
              coordinates: {
                lat: req.query.lat,
                lng: req.query.lng,
              },
            },
            nextOccurence: MoreThanOrEqual(new Date()),
          },
          select: {
            startDate: true,
            endDate: true,
            recurring: true,
            venue: {
              name: true,
              coordinates: {
                lat: true,
                lng: true,
              },
            },
          },
        }),
      );
    } catch (e) {
      return next(e);
    }
  };

  post = async (req: TypedRequest<any, any, EventRegisterType, any>, res: Response, next: NextFunction) => {
    try {
      const errors = await customValidator(EventRegisterDTO, req.body);

      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      }

      if (req.body.type === EventType.OFFLINE) {
        const overlappingEvents = await this.service.get_overlapping_events(
          req.body.venue,
          new Date(req.body.startDate),
          new Date(req.body.endDate),
        );

        if (overlappingEvents) {
          return next(new AppError("Venue already booked", 400));
        }
      }

      const newEvent = new Event();
      newEvent.userId = req.auth?.user?.id;
      newEvent.startDate = new Date(req.body.startDate);
      newEvent.endDate = new Date(req.body.endDate);
      newEvent.description = req.body.description;
      newEvent.nextOccurence = new Date(req.body.startDate);
      newEvent.tags = req.body.tags;
      newEvent.title = req.body.title;
      newEvent.venue = req.body.venue;
      newEvent.location = req.body.location;
      const coverImageIndex = req.body.cover ? +req.body.cover : 0;

      newEvent.images = [];
      for await (const [i, file] of (req.files as Record<string, any>[]).entries()) {
        const messageImages = await streamUpload(file.buffer, "messages");
        newEvent.images.push({
          name: messageImages.url,
          cover: coverImageIndex === i,
        });
      }

      newEvent.ticketTypes = req.body.ticketTypes.map((type) => ({
        id: v4(),
        ...type,
      }));
      newEvent.type = req.body.type || EventType.OFFLINE;
      newEvent.recurring = req.body.recurring ?? 0;
      const savedEvent = await this.service.save(newEvent);

      await this.service.add_categories(savedEvent.id, req.body.categories);

      res.status(201).json(savedEvent);
    } catch (e) {
      return next(e);
    }
  };

  put = async (
    req: TypedRequest<{ id: string }, any, Partial<EventRegisterType>, any>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const event = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
        select: {
          id: true,
          userId: true,
          ticketTypes: true,
        },
      });

      if (!event) {
        return next(new AppError("No Event Found", 400));
      }
      if (event.userId !== req.auth?.user?.id) {
        return next(new AppError("Not Authorized", 401));
      }
      if (req.body.startDate) {
        event.startDate = new Date(req.body.startDate);
        event.nextOccurence = new Date(req.body.startDate);
      }
      if (req.body.endDate) event.endDate = new Date(req.body.endDate);
      if (req.body.description) event.description = req.body.description;
      if (req.body.recurring) event.recurring = req.body.recurring;
      if (req.body.type) event.type = req.body.type;
      if (req.body.tags) event.tags = req.body.tags;
      if (req.body.title) event.title = req.body.title;
      if (req.body.venue) {
        if (event.type === EventType.OFFLINE) {
          const eventBookedWithThisVenue = await this.service.findOne({
            findFields: create_finder_for_venue_date_checker(req.body.venue, req.body.startDate, req.body.endDate),
          });
          if (eventBookedWithThisVenue) {
            return next(new AppError("Venue already booked", 400));
          }
        }
        event.venue = req.body.venue;
      }
      if (req.body.ticketTypes) {
        req.body.ticketTypes?.forEach((type) => {
          if (!type.id) {
            event.ticketTypes.push({
              id: v4(),
              ...type,
              ...(type.count && { count: +type.count }),
            });
          }
          const index = event.ticketTypes.findIndex((ticket) => ticket.id === type.id);
          if (index > -1) {
            event.ticketTypes[index] = {
              ...event.ticketTypes[index],
              ...type,
              ...(type.count && { count: +type.count }),
            };
          } else throw new AppError("Something went wrong", 400);
        });
      }

      const savedEvent = await this.service.save(event);
      res.status(201).json(savedEvent);
    } catch (e) {
      return next(e);
    }
  };

  toggleApproval = async (req: TypedRequest<{ id: string }, any, any, any>, res: Response, next: NextFunction) => {
    try {
      const event = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
        relations: {
          user: true,
        },
      });
      if (!event) {
        return next(new AppError("No Event Found", 400));
      }
      event.approvedBy = event.approvedBy ? null : req.auth.id;
      const toggledEvent = await this.service.save(event);
      res.status(200).json(toggledEvent);
    } catch (e) {
      return next(e);
    }
  };
  event_stats = async (req: Request<any, any, any, EventSearchType>, res: Response, next: NextFunction) => {
    try {
      const events = await this.service.search_events(req.query);
      res.status(200).json(events);
    } catch (e) {
      return next(e);
    }
  };

  togglePublish = async (req: TypedRequest<{ id: string }, any, any, any>, res: Response, next: NextFunction) => {
    try {
      const event = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
        relations: {
          categories: true,
          user: true,
        },
        select: {
          title: true,
          user: {
            name: true,
          },
          userId: true,
          approvedBy: true,
          startDate: true,
          endDate: true,
          venue: {
            coordinates: {
              lat: true,
              lng: true,
            },
            name: true,
          },
          id: true,
          images: true,
        },
      });
      if (!event) {
        return next(new AppError("No Event Found", 400));
      }
      if (event.userId !== req.auth?.user.id) {
        return next(new AppError("Not Authorized", 401));
      }
      if (!event.approvedBy) {
        return next(new AppError("Not appvoed yet", 400));
      }

      event.isPublished = !event.isPublished;

      const savedEvent = await this.service.save(event);
      queueService.addToQueue({
        action: QueueAction.SEND_EVENT_DETAIL,
        data: event,
      });
      res.status(201).json(savedEvent);
    } catch (e) {
      return next(e);
    }
  };

  events_recommendations = async (
    req: TypedRequest<unknown, unknown, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const recommendedEvents = await this.service.get_events_from_categories(req.auth?.user?.preferences || []);
      res.status(200).json(recommendedEvents);
    } catch (e) {
      return next(e);
    }
  };
}
