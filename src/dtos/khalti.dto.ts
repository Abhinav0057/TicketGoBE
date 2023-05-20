import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsNumber, IsString } from "class-validator";

export type KhaltiRequestInitiatePayload = {
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  /**
   * @example
   *   {
          label: "Mark Price",
          amount: 1000,
        },
   */
  amountBreakDown: {
    label: string;
    amount: number;
  }[];

  /**
     * @example
     *   {
          identity: "1234567890",
          name: "Khalti logo",
          total_price: 1300,
          quantity: 1,
          unit_price: 1300,
        },
     */
  productDetails: {
    identity: string;
    name: string;
    total_price: number;
    quantity: number;
    unit_price: number;
  }[];
};

export class CustomerInfoDTO {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  phone: string;
}
export class AmountBreakdownDTO {
  @IsDefined()
  @IsString()
  label: string;

  @IsDefined()
  @IsNumber()
  amount: number;
}

export class ProductDetailsDTO {
  @IsDefined()
  @IsString()
  identity: string;

  @IsDefined()
  @IsNumber()
  name: number;

  @IsDefined()
  @IsNumber()
  total_price: number;

  @IsDefined()
  @IsNumber()
  quantity: number;

  @IsDefined()
  @IsNumber()
  unit_price: number;
}

export class KhaltiPaymentDTO {
  @IsDefined()
  @Type(() => CustomerInfoDTO)
  customerInfo: KhaltiRequestInitiatePayload["customerInfo"];

  @IsDefined()
  @Type(() => AmountBreakdownDTO)
  amountBreakDown: KhaltiRequestInitiatePayload["amountBreakDown"];

  @IsDefined()
  @Type(() => ProductDetailsDTO)
  productDetails: KhaltiRequestInitiatePayload["productDetails"];

  @IsDefined()
  @IsNumber()
  amount: number;
}
