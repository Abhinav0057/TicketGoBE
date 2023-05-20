import { CategoryGroup } from "../../database/entity/CategoryGroup";
import { Service } from ".";

export class CategoryGroupService extends Service<CategoryGroup> {
  constructor() {
    super(CategoryGroup);
  }
}
