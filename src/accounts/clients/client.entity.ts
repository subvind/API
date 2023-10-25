import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';
import { Account } from '../account.entity';

export enum ClientStatus {
  FREE = 'Free', // this account is not paying anything
  PLUS = 'Plus', // this account is paying for ads to be removed
  PREMIUM = 'Premium', // this account is paying for plus and bonuses
}

@Entity()
export class Client {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: 'Free' })
  clientStatus: ClientStatus; // status can be 'Free', 'Plus', or 'Premium'

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
    console.log('client insert', this.id)
  }
}