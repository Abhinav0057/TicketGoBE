import Bull from "bull";
import { Attachment } from "nodemailer/lib/mailer";
import path from "path";
import { In } from "typeorm";

import { EventService } from "../../../api/services/event.service";
import { UserService } from "../../../api/services/user.service";
import { Event } from "../../../database/entity/Event";
import { User } from "../../../database/entity/User";
import { MailService } from "../Mail/mail.service";

export enum QueueAction {
  SEND_EVENT_DETAIL = "SEND_EVENT_DETAIL",
  SEND_RECURRING_MAIL = "SEND_RECURRING_MAIL",
  SEND_EVENT_START = "SEND_EVENT_START",
}

const recurringTemplate = (data: { name: string; startDate: Date; title: string; venueName: string }) =>
  `
<h1>Hello ${data.name}</h1>
<p>The event ${data.title} is going to start at ${new Date(data.startDate).toLocaleTimeString()} at ${
    data.venueName
  }</p>
`;

const getMailTemplate = (event: Partial<Event>, user: Partial<User>) => {
  if (event.isPublished)
    return `
      <h1>Hello ${user.name}</h1>
      <p>We are here with a new event by ${event.user.name}</p>
      <p>The event is going to be held at ${event.venue.name}, ${event.location} from ${new Date(
      event.startDate,
    )} to ${new Date(event.endDate)}</p>
        ${event.images.length && `<p>Please see our attached brochure for more details</p>`}
        <h3>Thank you</h3>
    `;

  return `
        <h1>Hello ${user.name}</h1>
      <p>We have a sad news regarding ${event.title}</p>
      <p>The event going to be held at ${event.venue.name}, ${event.location} from ${new Date(
    event.startDate,
  )} to ${new Date(event.endDate)} has just been cancelled</p>
        <h3>Sorry and Thank you</h3>
      `;
};

export type QueueJobType = { data: any; action: QueueAction };

export class QueueService {
  private queue = new Bull("sendmail", {
    redis: {
      host: process.env.redis_host,
      port: +process.env.redis_port,
      username: process.env.redis_user,
      password: process.env.redis_password,
    },
  });
  private userService = new UserService();
  private mailService = new MailService();
  private eventService = new EventService();

  constructor() {
    this.onceReady();

    this.queue.process(async (job: Bull.Job<QueueJobType>) => {
      this.process_events(job);
    });
  }
  private process_events = async (job: Bull.Job<QueueJobType>) => {
    switch (job.data.action) {
      case QueueAction.SEND_EVENT_DETAIL: {
        const event = job.data.data as Partial<Event>;
        const categoryIds = event.categories.map((ca) => `${ca.id}`);
        const users = await this.userService.findAll({
          findFields: {
            preferences: {
              id: In(categoryIds),
            },
          },
          relations: {
            auth: true,
          },
        });

        for await (const user of users[0]) {
          if (user.subscribed) {
            const image = event.images.find((image) => !!image.cover)?.name;
            await this.sendMail(user.auth.email, `${event.title}`, getMailTemplate(event, user), [
              {
                path: `${path.join(__dirname, `../../../files/${image}`)}`,
              },
            ]);
          }
        }
        return;
      }
      case QueueAction.SEND_RECURRING_MAIL: {
        const data = job.data.data;
        await this.sendMail(
          data.email,
          `Event about to Start`,
          recurringTemplate({
            name: data.name,
            title: data.title,
            venueName: data.venue.name,
            startDate: data.startDate,
          }),
        );
        return await this.updateEventOccurrence(data.id);
      }

      case QueueAction.SEND_EVENT_START: {
        const eventToSend = job.data.data.event;
        const auth = job.data.data.auth;
        if (eventToSend && auth) {
          return await this.sendMail(
            auth.email,
            `Event about to Start`,
            recurringTemplate({
              name: auth.user.name,
              title: eventToSend.title,
              venueName: eventToSend.venue.name,
              startDate: eventToSend.startDate,
            }),
          );
        }
        return;
      }
    }
  };

  private updateEventOccurrence = async (eventId: string) => {
    try {
      const event = await this.eventService.findOne({
        findFields: {
          id: eventId,
        },
      });
      if (event) {
        event.nextOccurence = new Date(new Date().setDate(new Date().getDate() + event.recurring));
        return await this.eventService.save(event);
      }
    } catch (e) {
      console.log("Error while updateing event last occurrence");
    }
  };

  private onceReady(): any {
    if (this.queue.client.status === "ready") {
      return console.log("Connected to Redis Client");
    }
    return setTimeout(() => {
      console.log("Connecting to Redis client");
      return this.onceReady();
    }, 500);
  }

  addToQueue = async (data: QueueJobType, options?: Bull.JobOptions) => {
    const config: Bull.JobOptions = {
      attempts: 5,
      removeOnFail: true,
      removeOnComplete: true,
      ...options,
    };
    return await this.queue.add(data, config);
  };

  private sendMail = async (reciever: string, subject: string, html: string, attachments?: Attachment[]) => {
    return await this.mailService.sendMail(reciever, subject, html, attachments);
  };
}

export const queueService = new QueueService();
