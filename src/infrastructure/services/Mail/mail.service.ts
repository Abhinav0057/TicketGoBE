import { AttachmentLike } from "nodemailer/lib/mailer";

import { NodeMailerProvider } from "./Providers/nodemailer.provider";

export interface IMailService {
  host: string;
  port: number;
  service: string;
  user: string;
  pass: string;
  encryption: string;
}
export class MailService {
  private provider: any;

  constructor(authProvider = "nodemailer") {
    this.setProvider(authProvider);
  }

  setProvider = (provider: string) => {
    switch (provider) {
      case "nodemailer":
        this.provider = new NodeMailerProvider();
        break;

      default:
        break;
    }
  };

  sendMail = async (to: string, subject = "Test", html: string | Buffer, attachments: AttachmentLike[]) => {
    return await this.provider.send_mail({
      to,
      subject,
      html,
      attachments,
    });
  };
}
