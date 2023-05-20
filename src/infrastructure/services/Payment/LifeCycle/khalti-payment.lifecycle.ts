import axios from "axios";
import crypto from "crypto";
import { v4 } from "uuid";

import { KhaltiRequestInitiatePayload } from "../../../../dtos/khalti.dto";

const headers = {
  Authorization: `key ${process.env.khalti_live_secret_key}`,
};

/**
 * This will generate response in format 
 *   "pidx": "S8QJg2VALZGTJRkKqVxjqB",
     "payment_url": "https://test-pay.khalti.com/?pidx=S8QJg2VALZGTJRkKqVxjqB/"
    Client should redirect user to payment_url
* When the payment is successful with following details in query params of our return_url 
    pidx - The initial payment identifier
    transaction_id - _The transaction identifier at Khalti after successful payment
    amount - Amount paid in paisa
    mobile - Payer Mobile
    purchase_order_id - The initial purchase_order_id provided during payment initiate
    purchase_order_name - The initial purchase_order_name provided during payment initiate
    @example https://example.com/payment?pidx=EwGKrbdaYLTQ4rmWtNAMEJ
    &amount=1300
    &mobile=98XXXXX403
    &purchase_order_id=test12
    &purchase_order_name=test
    &transaction_id=MJbBJDKYziWqgvkgjxhS2W

 * Failure of payment would result in following redirection to return_url
    @example https://example.com/payment?message=Could%20not%20process%20the%20payment.
 * @param customerInfo 
 * @param amountBreakDown 
 * @param productDetails 
 */
export const KhaltiPaymentInitiation = async ({
  amount,
  customerInfo,
  productDetails,
  amountBreakDown,
}: KhaltiRequestInitiatePayload) => {
  return await axios.post(
    "https://khalti.com/api/v2/epayment/initiate/",
    {
      return_url: process.env.khalti_return_url,
      website_url: process.env.khalti_web_url,
      purchase_order_id: v4(),
      purchase_order_name: crypto.randomBytes(64).toString("hex"),
      amount,
      customer_info: customerInfo,
      amount_breakdown: amountBreakDown,
      product_details: productDetails,
    },
    {
      headers,
    },
  );
};

/**
 * using pidx we verify the payment process
 * @param pidx
 * @returns
 */
export const KhaltiPaymentVerification = async (data: { pidx: string }) => {
  return await axios.post("https://khalti.com/api/v2/epayment/lookup/", data, { headers });
};
