import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { CategoryGroup } from "./CategoryGroup";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, select: false })
  categoryGroupId: string;

  @ManyToOne((type) => CategoryGroup)
  @JoinColumn({ name: "categoryGroupId", referencedColumnName: "id" })
  categoryGroup: CategoryGroup;
}
