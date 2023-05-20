import * as cron from "node-cron";

import { AppDataSource } from "../../../database/config";
import { getMilliseconds } from "../../../utils/dates";
import { QueueAction, queueService } from "./queue.service";

export const scheduleCron = () => {
  cron.schedule("0 0 * * *", async () => {
    const subscribedUsers = await AppDataSource.createQueryRunner().manager.query(
      `
        WITH event_bought AS (SELECT "event"."venue","event"."next_occurence"  as check_date,
        "event"."location","event"."recurring", "event"."title", "event"."start_date", "event"."end_date", "event"."next_occurence", 
        "tickets"."userId" FROM tickets INNER JOIN event ON "tickets"."eventId" = "event"."id"),
        full_users AS (SELECT "user"."id", "auth"."email", "user"."name" from "user" INNER JOIN "auth" ON "user"."authId" = "auth"."id"),
        event_to_mail as (  SELECT *  FROM event_bought INNER JOIN full_users ON "full_users"."id" = "event_bought"."userId")
        SELECT * FROM event_to_mail where check_date::date = now()::date;        
        `,
    );
    subscribedUsers.forEach((data: any) => {
      const delay = calculateDelay(data.startDate);
      if (delay) {
        queueService.addToQueue(
          {
            data,
            action: QueueAction.SEND_RECURRING_MAIL,
          },
          {
            delay,
          },
        );
      }
    });
  });
};

export const calculateDelay = (date: Date) => {
  const today = new Date().setHours(0, 0, 0, 0);
  if (today !== new Date(date).setHours(0, 0, 0, 0)) {
    return 0;
  }
  const delay = getMilliseconds(date) - getMilliseconds(new Date());
  //1 hour
  if (delay > 3.6e6) {
    return delay - 3.6e6;
  }
  //30 minutes
  if (delay > 1.8e6) {
    return delay - 1.8e6;
  }
  //15 minutes
  if (delay > 900000) {
    return delay - 900000;
  }
  if (delay > 300000) {
    return delay - 300000;
  }
  return 0;
};
