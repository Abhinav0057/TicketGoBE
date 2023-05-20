import { Expose, Type } from "class-transformer";
import { ArrayNotEmpty, IsDefined } from "class-validator";

export enum EventType {
  ONLINE = "online",
  OFFLINE = "offline",
}

export type TicketType = {
  id?: string;
  name: string;
  description: string;
  count: number;
  price: string;
};

export type EventRegisterType = {
  startDate: string;
  endDate: string;
  description: string;
  tags: string[];
  title: string;
  venue: VenueType;
  categories: string[];
  location: string;
  ticketTypes: TicketType[];
  type?: EventType;
  recurring?: number;
  cover?: number; //which index image is the cover image
};

export class VenueCoordinatesDTO {
  @IsDefined()
  @Expose()
  lat: string;

  @IsDefined()
  @Expose()
  lng: string;
}

export class VenueDTO {
  @IsDefined()
  @Expose()
  name: string;

  @IsDefined()
  @Expose()
  coordinates: VenueCoordinatesDTO;
}

export class TicketTypes {
  @IsDefined()
  @Expose()
  name: string;

  @IsDefined()
  @Expose()
  price: string;

  @IsDefined()
  @Expose()
  description: string;

  @IsDefined()
  @Expose()
  count: number;
}

export type EventSearchType = {
  user?: string;
  isPublished?: string;
  startDate?: string;
  endDate?: string;
  tags?: string;
  venue?: string;
  location?: string;
  title?: string;
  type?: EventType;
  page?: number;
  pageCount?: number;
};

export type VenueType = {
  name: string;
  coordinates: {
    lat: string;
    lng: string;
  };
};

export class EventRegisterDTO {
  @IsDefined()
  @Expose()
  startDate: Date;

  @IsDefined()
  @Expose()
  endDate: Date;

  @Expose()
  recurring: number;

  @Expose()
  type: EventType;

  @IsDefined()
  @Expose()
  description: string;

  @IsDefined()
  @Expose()
  location: string;

  @IsDefined()
  @Expose()
  title: string;

  @IsDefined()
  @Expose()
  @Type(() => VenueDTO)
  venue: VenueDTO;

  @IsDefined()
  @Expose()
  tags: string[];

  @IsDefined()
  @Expose()
  categories: string[];

  @IsDefined()
  @Expose()
  @Type(() => TicketTypes)
  @ArrayNotEmpty()
  ticketTypes: TicketTypes[];
}
