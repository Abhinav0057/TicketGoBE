import {
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Gender } from "../../dtos/auth.dto";
import { Auth } from "./Auth";
import { Category } from "./Category";
import { Company } from "./Company";
import { Event } from "./Event";

// User who registered
@Entity()
export class User {
  // id
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // name of person who registered
  @Column({ nullable: false })
  name: string;

  @Column({
    unique: true,
  })
  phone: string;

  @Column()
  dob: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: Gender,
    default: Gender.OTHER,
  })
  gender: Gender;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ default: false })
  subscribed: boolean;

  @ManyToMany((type) => Category, {
    cascade: true,
  })
  @JoinTable({
    name: "users_preferences",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "categoryId", referencedColumnName: "id" },
  })
  preferences: Category[];

  @OneToOne(() => Auth)
  @JoinColumn()
  auth: Auth;

  @ManyToMany((type) => User, {
    cascade: true,
  })
  @JoinTable({
    name: "users_following",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "followingUserId", referencedColumnName: "id" },
  })
  followingOrganizer: User[];

  @ManyToMany((type) => Event, {
    cascade: true,
  })
  @JoinTable({
    name: "users_favorites",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "favoriteId", referencedColumnName: "id" },
  })
  favoriteEvents: Event[];

  @OneToOne(() => Company, (company) => company.user)
  company: Company;

  @BeforeUpdate()
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
