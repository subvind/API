import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';
import { Account } from '../account.entity';

export enum EmployeeStatus {
  VOID = 'Void', // we don't know
  HIRING = 'Hiring', // this account wants to be an employee
  REJECTED = 'Rejected', // this new hire will not be working here
  WORKING = 'Working', // this employee is working here
  SUSPENDED = 'Suspended', // not fired or quit
  FIRED = 'Fired', // this employee does not work here anymore
  QUIT = 'Quit', // this employee will not work here anymore
  BANNED = 'Banned', // this employee has done something wrong
}

@Entity()
export class Employee {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: 'Void' })
  employeeStatus: EmployeeStatus; // status can be 'Void', 'Hiring', etc.

  // Reference to the owning side entity (Account)
  // No specific relationship decorator is needed here
  account: Account;
  
  /**
   * Other properties and relationships as needed
   */

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('employee insert', this.id)
  }
}