import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';

import { hash } from 'bcrypt';

import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { Organization } from '../organizations/organization.entity';

export enum AuthStatus {
  BANNED = 'Banned',
  VERIFIED = 'Verified',
  PENDING = 'Pending',
}

@Entity()
@Unique(['username']) 
@Unique(['email']) 
@Unique(['firstName', 'lastName']) 
export class User {
  @PrimaryColumn('uuid')
  id: string;
  
  @ApiProperty({ example: 'johndoe', description: 'The username of the user' })
  @Column({ type: 'varchar', length: 18 })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores'
  })
  username: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @Column()
  lastName: string;

  @ApiProperty({ example: 'john.doe@gmail.com', description: 'The email address of the user' })
  @Column({ select: false }) // Exclude 'password' from default selection
  email: string;

  @ApiProperty({ example: 'jd2023', description: 'The secret password of the user' })
  @Column({ select: false }) // Exclude 'password' from default selection
  password: string;

  @Column({ default: 'Pending' })
  authStatus: AuthStatus; // status can be 'admin', 'employee', etc.

  @ApiProperty({ example: 'TravisBurandt', description: 'The twitter url slug of the user' })
  @Column({ nullable: true })
  twitter: string;

  @ApiProperty({ example: 'Traveco504', description: 'The youtube url slug of the user' })
  @Column({ nullable: true })
  youtube: string;

  @Column({ select: false, nullable: true })
  emailVerificationToken: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ select: false, nullable: true })
  recoverPasswordToken: string;

  /**
   * Other properties and relationships as needed
   */

  @OneToMany(() => Organization, organization => organization.owner, { nullable: true })
  organizations: Organization[]

  @ManyToOne(() => Organization, organization => organization.id)
  defaultOrganization: Organization;

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
    console.log('user insert', this.id)
  }

  @BeforeInsert()
  generateEmailVerificationToken() {
    if (!this.emailVerificationToken) {
      this.emailVerificationToken = uuidv4();
    }
    console.log('user email verification token', this.emailVerificationToken)
  }
}
