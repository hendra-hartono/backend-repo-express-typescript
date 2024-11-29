import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";

import { User } from "./user";
import { Patient } from "./patient";

@Entity({ name: "medications" })
export class Medication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.id)
  patient: Patient;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  dosage: string;

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;

  @Column({ nullable: false })
  frequency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
