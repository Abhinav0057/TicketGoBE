import { AppDataSource } from "../../database/config";
import { Tickets } from "../../database/entity/Tickets";
import { TicketType } from "../../dtos/event.dto";
import { Service } from ".";

export class TicketService extends Service<Tickets> {
  constructor() {
    super(Tickets);
  }

  insert_tickets_bought = async (bookDetails: TicketType[], boughtById: string, eventId: string) => {
    return await AppDataSource.createQueryBuilder()
      .insert()
      .into(Tickets)
      .values(
        bookDetails.map((detail) => ({
          boughtById,
          eventId,
          type: detail,
        })),
      )
      .execute();
  };

  rollBack_tickets_bought = async (tickets: string[]) => {
    return await AppDataSource.createQueryBuilder()
      .delete()
      .from(Tickets)
      .where("id In(:id)", {
        id: tickets,
      })
      .execute();
  };
}
