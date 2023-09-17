import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';
import { Account } from '../account.entity';

export enum SupplierStatus {
  VOID = 'Void', // we don't know
  WAITING = 'Waiting', // this account waiting to be connected or rejected
  PENDING = 'Pending', // this supplier pending to be connected or rejected
  CONNECTED = 'Connected', // this account is connected to this supplier
  REJECTED = 'Rejected', // this account and supplier have rejected one another 
  BANNED = 'Banned', // this supplier has done something wrong
}

@Entity()
export class Supplier {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: 'Void' })
  supplierStatus: SupplierStatus; // status can be 'Void', 'Hiring', etc.

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
    console.log('supplier insert', this.id)
  }
}