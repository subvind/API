import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { Organization } from '../organizations/organization.entity';
import { Account } from '../accounts/account.entity';

@Entity()
@Unique(['ipAddress', 'organization'])
export class Guest {
  @PrimaryColumn('uuid')
  id: string;
  
  @ApiProperty({ example: '127.0.0.1', description: 'The ip address of the guest' })
  @Column()
  ipAddress: string;

  @ApiProperty({ example: '', description: 'The browser headers of the guest' })
  @Column({ nullable: true })
  headers: string;

  @ManyToOne(() => Organization, organization => organization.id)
  organization: Organization;

  @ManyToOne(() => Account, account => account.id, { nullable: true })
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
    console.log('user insert', this.id)
  }
}
