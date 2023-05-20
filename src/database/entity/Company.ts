import { BeforeUpdate, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User";

@Entity()
export class Company {
  // id
  @PrimaryGeneratedColumn("uuid")
  id: string;

  //company Name
  @Column()
  name: string;

  //company registration number
  @Column({ unique: true })
  registrationNo: string;

  //company registration number
  @Column({ unique: true })
  PAN: string;

  @Column({
    unique: true,
  })
  phone: string;

  @Column()
  registrationDate: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ nullable: true })
  description: string;

  @Column("text", { nullable: true, array: true })
  company_docs: string[];

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @BeforeUpdate()
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
