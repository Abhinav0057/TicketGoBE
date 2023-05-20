import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { EventType, TicketType, VenueType } from "../../dtos/event.dto";
import { Category } from "./Category";
import { User } from "./User";

@Entity()
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ default: false }) isPublished: boolean;

  @Column({ select: false })
  description: string;

  @Column("jsonb", { nullable: true })
  venue: VenueType;

  @Column("jsonb", { nullable: true })
  ticketTypes: TicketType[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  recurring: number; //How many days of recurring

  @Column({ nullable: true, name: "next_occurence" })
  nextOccurence: Date; // When to occur next? if not recurring same as startDate

  @Column({
    type: "enum",
    enum: EventType,
    default: EventType.OFFLINE,
  })
  type: EventType;

  @Column({ name: "approved_by", nullable: true })
  approvedBy: string;

  @Column({ name: "start_date" })
  startDate: Date;

  @Column({ name: "end_date" })
  endDate: Date;

  @Column("text", { array: true })
  tags: string[];

  @Column("jsonb", { nullable: true })
  images: { cover?: boolean; name: string }[];

  @ManyToMany((type) => Category, {
    cascade: true,
  })
  @JoinTable({
    name: "events_categories",
    joinColumn: { name: "eventId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "categoryId", referencedColumnName: "id" },
  })
  categories: Category[];

  @Column({ type: "uuid", nullable: true, select: false })
  userId: string;

  @ManyToOne((type) => User)
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  user: User;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @BeforeUpdate()
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
