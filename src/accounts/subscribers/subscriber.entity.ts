import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';
import { Account } from '../account.entity';

export enum SubscriberStatus {
  VOID = 'Void', // we don't know
  UNSUBSCRIBED = 'Unsubscribed',
  SUBSCRIBED = 'Subscribed',
  SUBSCRIBED_WITH_NOTIFICATIONS = 'Subscribed with notifications',
}

@Entity()
export class Subscriber {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: 'Void' })
  subscriberStatus: SubscriberStatus; // status can be 'Free', 'Plus', or 'Premium'

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
    console.log('subscriber insert', this.id)
  }
}