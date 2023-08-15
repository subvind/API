import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/user.entity';
import { Inventory } from '../inventory/inventory.entity';
import { Location } from '../locations/location.entity';
import { Product } from '../products/product.entity';

@Entity()
@Unique(['orgname']) 
export class Organization {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: 'acme', description: 'The orgname of the organization' })
  @Column({ type: 'varchar', length: 18 })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Orgname can only contain letters, numbers, and underscores'
  })
  orgname: string;

  @ApiProperty({ example: 'ACME Corp.', description: 'The display name of the organization' })
  @Column()
  displayName: string;

  /**
   * Other properties and relationships as needed
   */

  @ManyToOne(() => User, user => user.organizations)
  owner: User;

  // the currectly selected organization by a user
  @OneToMany(() => User, user => user.defaultOrganization, { nullable: true })
  defaultOrganizations: User[]

  // inventory
  @OneToMany(() => Inventory, inventory => inventory.id, { nullable: true })
  inventory: Inventory[]

  // locations
  @OneToMany(() => Location, location => location.id, { nullable: true })
  locations: Location[]

  // products
  @OneToMany(() => Product, product => product.id, { nullable: true })
  products: Product[]

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('before insert', this.id)
  }
}