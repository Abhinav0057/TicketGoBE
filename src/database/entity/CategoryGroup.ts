import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Category } from "./Category";

@Entity()
export class CategoryGroup {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    unique: true,
  })
  name: string;

  @OneToMany(() => Category, (category) => category.categoryGroup)
  categories: Category[];
}
