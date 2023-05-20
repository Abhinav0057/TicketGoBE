import { Between, LessThan, MoreThan, MoreThanOrEqual } from "typeorm";

import { AppDataSource } from "../../database/config";
import { Category } from "../../database/entity/Category";
import { Event } from "../../database/entity/Event";
import { EventSearchType, EventType, TicketType, VenueType } from "../../dtos/event.dto";
import { getMilliseconds } from "../../utils/dates";
import { AppError } from "../../utils/httpError";
import { Service } from ".";

export class EventService extends Service<Event> {
  constructor() {
    super(Event);
  }

  add_categories = async (eventId: string, categoryIds: string[]) => {
    for await (const categoryId of categoryIds) {
      await this.queryRunner.manager.query(
        `INSERT INTO events_categories("eventId", "categoryId") VALUES ('${eventId}', '${categoryId}')`,
      );
    }
    return;
  };

  get_events_from_categories = async (categories: Category[]) => {
    return await this.queryRunner.manager.query(
      `SELECT * from event where id IN (select "eventId" from events_categories where "categoryId" in (${categories.map(
        (c) => `'${c.id}'`,
      )}))`,
    );
  };

  search_events = async (fields: EventSearchType & { user?: string }) => {
    const {
      startDate,
      endDate,
      tags,
      isPublished = "true",
      title,
      location,
      venue,
      user,
      type,
      page,
      pageCount,
    } = fields;

    const builder = AppDataSource.createQueryBuilder(Event, "event")
      .select([
        "event.id",
        "event.title",
        "event.description",
        "event.ticketTypes",
        "event.venue",
        "event.recurring",
        "event.location",
        "event.images",
        "event.startDate",
        "event.endDate",
        "user.id",
        "user.name",
        "user.phone",
        "user.description",
        "company.id",
        "company.name",
        "company.description",
        "company.phone",
        "event.isPublished",
        "event.approvedBy",
      ])
      .leftJoin("event.user", "user")
      .leftJoin("user.company", "company");

    if (page && pageCount) {
      builder.take(pageCount).skip(page * pageCount);
    }

    builder.where("event.isPublished = :isPublished", { isPublished: isPublished === "true" });

    if (user) {
      builder.andWhere("user.id = :user OR company.id = :user", { user });
    }

    if (title) builder.andWhere("LOWER(event.title) LIKE LOWER(:title)", { title });

    if (venue) builder.andWhere("LOWER(event.venue) LIKE LOWER(:venue)", { venue });

    if (location)
      builder.andWhere("LOWER(event.location) LIKE LOWER(:location)", {
        location: location.toLowerCase(),
      });

    if (tags) builder.andWhere("event.tags @> :tags", { tags: tags.split(",") });

    if (type) builder.andWhere("event.type LIKE :type", { type });

    builder.andWhere(`"event"."start_date">=:startDate`, {
      startDate: new Date(new Date(startDate || Date.now()).setHours(0, 0, 0, 0)),
    });

    if (endDate) {
      builder.andWhere(`"event"."end_date"<=:endDate`, {
        endDate: new Date(new Date(endDate).setHours(23, 59, 59, 99)),
      });
    }

    return await builder.getManyAndCount();
  };

  deduct_ticket_count_from_ticket_type = async (event: Event, bookDetails: TicketType[]) => {
    bookDetails.forEach((detail) => {
      const ticketIndex = event.ticketTypes.findIndex((ticket) => ticket?.id === detail?.id);
      if (ticketIndex < 0) {
        throw new Error("No such tickets are being sold");
      }
      if (detail.count > event.ticketTypes[ticketIndex].count) {
        throw new AppError("Something went wrong", 400);
      }
      if (ticketIndex > -1) {
        event.ticketTypes[ticketIndex].count -= detail.count;
      } else {
        throw new AppError("Something went wrong", 400);
      }
    });
    return await this.save(event);
  };

  rollback_ticket_count_from_ticket_type = async (event: Event, bookDetails: TicketType[]) => {
    bookDetails.forEach((detail) => {
      const ticketIndex = event.ticketTypes.findIndex((ticket) => ticket?.id === detail?.id);
      if (ticketIndex < 0) {
        throw new Error("No such tickets are being sold");
      }
      if (detail.count > event.ticketTypes[ticketIndex].count) {
        throw new AppError("Something went wrong", 400);
      }
      if (ticketIndex > -1) {
        event.ticketTypes[ticketIndex].count += detail.count;
      } else {
        throw new AppError("Something went wrong", 400);
      }
    });
    await this.save(event);
  };

  get_overlapping_events = async (venue: VenueType, startDate: Date, endDate: Date): Promise<number> => {
    const events = await this.findAll({
      findFields: {
        venue: venue,
        type: EventType.OFFLINE,
      },
    });

    const findEventsWithOverlappingTime = events[0].reduce((val, event) => {
      const eventMilliStart = getMilliseconds(event.startDate);
      const eventMilliEnd = getMilliseconds(event.endDate);
      const queryMilliStart = getMilliseconds(startDate);
      const queryMilliEnd = getMilliseconds(endDate);
      if (
        (queryMilliStart <= eventMilliStart && queryMilliEnd <= eventMilliStart) ||
        (queryMilliStart >= eventMilliEnd && queryMilliEnd >= eventMilliEnd)
      ) {
        if (event.nextOccurence.toDateString() !== startDate.toDateString()) return val;
      }
      return [...val, event];
    }, [] as any);
    return findEventsWithOverlappingTime?.length;
  };
}

export const create_finder_for_venue_date_checker = (venue: VenueType, startDate: string, endDate: string) => {
  const venueFinder = {
    venue: {
      name: venue.name,
      coordinates: {
        lat: venue.coordinates.lat,
        lng: venue.coordinates.lng,
      },
    },
    type: EventType.OFFLINE,
  };
  return [
    {
      ...venueFinder,
      startDate: Between(new Date(startDate), new Date(endDate)),
      endDate: Between(new Date(startDate), new Date(endDate)),
    },
    {
      ...venueFinder,
      startDate: MoreThan(new Date(startDate)),
      endDate: LessThan(new Date(endDate)),
    },
  ];
};
