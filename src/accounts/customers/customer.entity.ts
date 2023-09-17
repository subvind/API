import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../account.entity';

export enum CustomerStatus {
  VOID = 'Void', // we don't know
  NEW = 'New', // this account wants to be a customer
  ESTABLISHED = 'Established', // this customer has done business at least once
  RECURRING = 'Recurring', // this customer has had recuring business
  SUSPENDED = 'Suspended', // this customer has been absent for a while
  BANNED = 'Banned', // this customer has done something wrong
}

@Entity()
export class Customer {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: 'Void' })
  customerStatus: CustomerStatus; // status can be 'Void', 'New', etc.

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
    console.log('customer insert', this.id)
  }
}