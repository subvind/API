import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';

import { hash } from 'bcrypt';

import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { Organization } from '../organizations/organization.entity';
import { Customer } from './customers/customer.entity';
import { Employee } from './employees/employee.entity';
import { Supplier } from './suppliers/supplier.entity';
import { Client } from './clients/client.entity';

export enum AuthStatus {
  BANNED = 'Banned',
  VERIFIED = 'Verified',
  PENDING = 'Pending',
}

export enum OrganizationStatus {
  CUSTOMER = 'Customer',
  EMPLOYEE = 'Employee',
  SUPPLIER = 'Supplier',
}

@Entity()
@Unique(['accountname', 'organization']) 
@Unique(['email', 'organization']) 
@Unique(['firstName', 'lastName', 'organization']) 
export class Account {
  @PrimaryColumn('uuid')
  id: string;
  
  @ApiProperty({ example: 'johndoe', description: 'The accountname of the account' })
  @Column({ type: 'varchar', length: 18 })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'accountname can only contain letters, numbers, and underscores'
  })
  accountname: string;

  @ApiProperty({ example: 'John', description: 'The first name of the account' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the account' })
  @Column()
  lastName: string;

  @ApiProperty({ example: 'john.doe@gmail.com', description: 'The email address of the account' })
  @Column({ select: false }) // Exclude 'password' from default selection
  email: string;

  @ApiProperty({ example: 'jd2023', description: 'The secret password of the account' })
  @Column({ select: false }) // Exclude 'password' from default selection
  password: string;

  @Column({ default: 'Pending' })
  authStatus: AuthStatus; // status can be 'Banned', 'Verified', 'Pending'

  @ApiProperty({ example: 'TravisBurandt', description: 'The twitter url slug of the account' })
  @Column({ nullable: true })
  twitter: string;

  @ApiProperty({ example: 'Traveco504', description: 'The youtube url slug of the account' })
  @Column({ nullable: true })
  youtube: string;

  @Column({ select: false, nullable: true })
  emailVerificationToken: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ select: false, nullable: true })
  recoverPasswordToken: string;

  @ManyToOne(() => Organization, organization => organization.id)
  organization: Organization;

  @Column({ default: 'Customer' })
  organizationStatus: OrganizationStatus; // status can be 'Customer', 'Employee', 'Supplier'.

  @OneToOne(() => Customer, { eager: true, cascade: true })
  @JoinColumn()
  customer: Customer;

  @OneToOne(() => Employee, { eager: true, cascade: true })
  @JoinColumn()
  employee: Employee;

  @OneToOne(() => Supplier, { eager: true, cascade: true })
  @JoinColumn()
  supplier: Supplier;

  @OneToOne(() => Client, { eager: true, cascade: true })
  @JoinColumn()
  client: Client;

  /**
   * Other properties and relationships as needed
   */

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('account insert', this.id)
  }

  @BeforeInsert()
  generateEmailVerificationToken() {
    if (!this.emailVerificationToken) {
      this.emailVerificationToken = uuidv4();
    }
    console.log('account email verification token', this.emailVerificationToken)
  }
}
