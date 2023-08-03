import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { hash } from 'bcrypt';

import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN = 'Admin',
  Verified = 'Verified',
  Pending = 'Pending',
  Guest = 'Guest',
}

@Entity()
@Unique(['email']) 
@Unique(['firstName', 'lastName']) 
export class User {
  @PrimaryColumn('uuid')
  id: string;
  
  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @Column()
  lastName: string;

  @ApiProperty({ example: 'john.doe@gmail.com', description: 'The email address of the user' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'jd2023', description: 'The secret password of the user' })
  @Column()
  password: string;

  @Column({ default: 'Pending' })
  role: string; // Role can be 'admin', 'employee', etc.

  // Other properties and relationships as needed

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('before insert', this.id)
  }
}
