import { PaymentType } from "../payment.service";

/**
 * Convert Request according to the payment type
 * @param type
 * @param payload
 * @returns
 */
export const toRequestType = (type: PaymentType, payload: any) => {
  switch (type) {
    case PaymentType.ESEWA:
      return {
        amt: 100,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: 100,
        pid: "ee2c3ca1-696b-4cc5-a6be-2c40d929d453",
      };
  }
};
