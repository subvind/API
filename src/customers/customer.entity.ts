import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

@Entity()
@Unique(['name']) 
export class Customer {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: 'John', description: 'The name of the customer' })
  @Column()
  name: string;

  @ApiProperty({ example: 'john.doe@gmail.com', description: 'The email address of the customer' })
  @Column()
  email: string;

  @ApiProperty({ example: '281-798-1234', description: 'The phone number of the customer' })
  @Column()
  phoneNumber: string;

  // Other properties and relationships as needed

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('before insert', this.id)
  }
}