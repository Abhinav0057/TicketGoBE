import { Category } from "../../database/entity/Category";
import { Service } from ".";

export class CategoryService extends Service<Category> {
  constructor() {
    super(Category);
  }
}
