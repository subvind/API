import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Location } from '../locations/location.entity';
import { Product } from '../products/product.entity';
import { Organization } from '../organizations/organization.entity';

export enum Status {
  ROOM = 'Room',
  RACK = 'Rack',
}

export enum RoomStatus {
  PRODUCT = 'Product',
  CONTAINER = 'Container',
}

export enum RackSectionStatus {
  PRODUCT = 'Product',
  CONTAINER = 'Container',
}

@Entity()
@Unique(['building', 'floor', 'room', 'rack', 'rackLevel', 'rackSection', 'container'])
export class Inventory {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '10', description: 'The number of products to keep' })
  @Column({ default: '1' })
  stock: number;

  @ApiProperty({ example: 'true', description: 'If this stock of inventory can be restored' })
  @Column({ default: 'true' })
  isRestockable: boolean;
  
  @OneToMany(() => Product, product => product.id, { nullable: true })
  products: Product[]

  @ManyToOne(() => Location, location => location.id, { nullable: true })
  location: Location;

  @ApiProperty({ example: 'A', description: 'The name of the building where this product is stocked' })
  @Column()
  building: string;
  
  @ApiProperty({ example: '1', description: 'The floor number of the building where this product is stocked in the building' })
  @Column()
  floor: number;

  @ApiProperty({ example: 'Rack', description: 'The stocked product\'s status in the room' })
  @Column({ default: 'Rack' })
  status: Status;
  
  @ApiProperty({ example: '123', description: 'The name of the room where this product is stocked on the floor' })
  @Column()
  room: string;

  @ApiProperty({ example: 'Product', description: 'The stocked product\'s status in the room' })
  @Column({ default: 'Product' })
  roomStatus: RoomStatus;

  @ApiProperty({ example: 'alpha', description: 'The name of the rack where this product is stocked' })
  @Column()
  rack: string;

  @ApiProperty({ example: '3', description: 'The level on the rack where this product is stocked' })
  @Column()
  rackLevel: number;

  @ApiProperty({ example: 'trinkets', description: 'The name of the section where this product is stocked on the rack' })
  @Column()
  rackSection: string;

  @ApiProperty({ example: 'Container', description: 'The stocked product\'s status in the rack' })
  @Column({ default: 'Product' })
  rackSectionStatus: RackSectionStatus;

  @ApiProperty({ example: 'toolbox', description: 'The name of the envelope, box, or bin where this product is stocked' })
  @Column({ nullable: true })
  container: string;

  /**
   * Other properties and relationships as needed
   */

  // tenant id
  @ManyToOne(() => Organization, organization => organization.id)
  organization: Organization;

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