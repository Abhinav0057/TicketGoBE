import { toRequestType } from "./mappers/toRequestType";
import { EsewaProvider } from "./Providers/esewa.provider";
import { KhaltiProvider } from "./Providers/khalti.provider";

export enum PaymentType {
  ESEWA = "esewa",
  KHALTI = "khalti",
}

export class PaymentService {
  private provider: any;
  private providerType: PaymentType;

  constructor(paymentProvider = PaymentType.KHALTI) {
    this.providerType = paymentProvider;
    this.setProvider(paymentProvider);
  }

  setProvider = (provider: string) => {
    switch (provider) {
      case PaymentType.ESEWA:
        this.provider = new EsewaProvider();
        break;

      case PaymentType.KHALTI:
        this.provider = new KhaltiProvider();
        break;

      default:
        break;
    }
  };
  pay = async (request: any) => {
    return await this.provider.make_payment(request);
  };

  verify = async (data: { pidx: string }) => {
    return await this.provider.verify_payment(data);
  };
}
