import { KhaltiRequestInitiatePayload } from "../../../../dtos/khalti.dto";
import { KhaltiPaymentInitiation, KhaltiPaymentVerification } from "../LifeCycle/khalti-payment.lifecycle";

export class KhaltiProvider {
  make_payment = async (data: KhaltiRequestInitiatePayload) => {
    return await KhaltiPaymentInitiation(data);
  };

  verify_payment = async (data: { pidx: string }) => {
    return await KhaltiPaymentVerification(data);
  };
}
