import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';
import { Account } from '../account.entity';

export enum ClientStatus {
  LEVEL_0 = 0, // free
  LEVEL_1 = 1, // $19
  LEVEL_2 = 2, // $250
  LEVEL_3 = 3, // $500
  LEVEL_4 = 4, // $750
  LEVEL_5 = 5, // $1000
  LEVEL_6 = 6, // ...
  LEVEL_7 = 7,
  LEVEL_8 = 8,
  LEVEL_9 = 9,
  LEVEL_10 = 10,
  LEVEL_11 = 11,
  LEVEL_12 = 12,
  LEVEL_13 = 13,
  LEVEL_14 = 14,
  LEVEL_15 = 15,
  LEVEL_16 = 16,
  LEVEL_17 = 17,
  LEVEL_18 = 18,
  LEVEL_19 = 19,
  LEVEL_20 = 20,
  LEVEL_21 = 21,
  LEVEL_22 = 22,
  LEVEL_23 = 23,
  LEVEL_24 = 24,
  LEVEL_25 = 25,
}

@Entity()
export class Client {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: 0 })
  clientStatus: ClientStatus; // status can be 0, 1, 2 ... etc

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