import { Expose } from "class-transformer";
import { ArrayNotEmpty, IsDefined } from "class-validator";

export class CategoryGroupDTO {
  @IsDefined()
  @Expose()
  name: string;

  @Expose()
  @ArrayNotEmpty()
  categories: object[];
}
