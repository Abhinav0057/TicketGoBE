import { BeforeInsert, BeforeUpdate, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { UserRole } from "../../dtos/auth.dto";
import { HashService } from "../../infrastructure/services/Hash/hash.service";
import { User } from "./User";

@Entity()
export class Auth {
  // id
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    unique: true,
  })
  userName: string;

  @Column({ select: false })
  password: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToOne(() => User, (user) => user.auth)
  user: User;

  @BeforeUpdate()
  private beforeUpdate() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  private async beforeInsert() {
    const password = await new HashService().hash(this.password);
    this.password = password;
  }
}
