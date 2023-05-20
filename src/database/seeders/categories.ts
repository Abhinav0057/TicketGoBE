import { v4 } from "uuid";

import { AppDataSource } from "../config";
import { Category } from "../entity/Category";
import { CategoryGroup } from "../entity/CategoryGroup";

export async function categoryGroupSeeders() {
  const categoryGroups = await AppDataSource.getRepository(CategoryGroup).find();
  if (categoryGroups.length) {
    console.log("Already has category groups");
    return;
  }
  const ids = [v4(), v4(), v4()];
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(CategoryGroup)
    .values([
      {
        id: ids[0],
        name: "Music",
      },
      {
        id: ids[1],
        name: "Food & Drinks",
      },
      {
        id: ids[2],
        name: "Health",
      },
    ])
    .execute();

  console.log("Category Groups added");
  await categorySeeders(ids);
}

export async function categorySeeders(ids: string[]) {
  const categories = await AppDataSource.getRepository(Category).find();
  if (categories.length) {
    console.log("Already has category data");
    return;
  }
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Category)
    .values([
      {
        id: v4(),
        name: "Pizza",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Burger",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Chowmein",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Tasty Food",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Tasty Food 2",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Tasty Food 4",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Tasty Food 3",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Jazz",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "RnB",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Blues",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Pop",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Spa",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Yoga",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Sauna",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
      {
        id: v4(),
        name: "Meditation",
        categoryGroupId: ids[Math.floor(Math.random() * ids.length)],
      },
    ])
    .execute();

  console.log("Categories added");
}
