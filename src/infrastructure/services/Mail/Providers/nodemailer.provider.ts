import nodemailer, { TransportOptions } from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
export interface IMessage {
  email: string;
  id: string;
}

export class NodeMailerProvider {
  private sender: any;
  constructor() {
    this.sender = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.sendmail_user,
        pass: process.env.sendmail_pass,
      },
      debug: process.env.NODE_ENV !== "production",
      logger: process.env.NODE_ENV !== "production",
    });
  }

  send_mail = async (mailContent: Options) => {
    return await this.sender.sendMail(mailContent);
  };
}
