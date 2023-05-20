import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const customValidator = async (DTO: any, body: any): Promise<any> => {
  const user = plainToInstance(DTO, body);
  const errors = await validate(user, { skipMissingProperties: true });
  if (errors.length > 0) {
    let errorTexts: any[] = [];
    for (const errorItem of errors) {
      errorTexts = errorTexts.concat(errorItem.constraints);
    }
    return errorTexts;
  }
  return null;
};
