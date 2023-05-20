import { BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { TicketType } from "../../dtos/event.dto";
import { Event } from "./Event";
import { User } from "./User";

@Entity()
export class Tickets {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: true, select: false })
  boughtById: string;

  @ManyToOne((type) => User)
  @JoinColumn({ name: "boughtById", referencedColumnName: "id" })
  boughtBy: User;

  @Column({ type: "uuid", nullable: true, select: false })
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: "eventId", referencedColumnName: "id" })
  event: Event;

  @Column("jsonb")
  type: TicketType;

  @Column({ nullable: true })
  checkedIn: Date;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @BeforeUpdate()
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
