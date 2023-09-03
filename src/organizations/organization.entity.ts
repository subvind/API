import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/user.entity';
import { Inventory } from '../inventory/inventory.entity';
import { Location } from '../locations/location.entity';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { Bucket } from '../buckets/bucket.entity';
import { File } from '../files/file.entity';

@Entity()
@Unique(['orgname']) 
@Unique(['hostname']) 
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

  @ApiProperty({ example: 'www.brokenrecord.store', description: 'The hostname of the organization' })
  @Column({ type: 'varchar', length: 256, nullable: true })
  @Matches(/^[a-z0-9.]+$/, {
    message: 'Orgname can only contain lowercase letters, numbers, and periods'
  })
  hostname: string;

  @ApiProperty({ example: 'ACME Corp.', description: 'The display name of the organization' })
  @Column()
  displayName: string;

  @ApiProperty({ example: 'ACME', description: 'The short name of the organization' })
  @Column({ type: 'varchar', length: 16, nullable: true })
  shortName: string;

  @ApiProperty({ example: 'Vintage & Antiques', description: 'The description of the organization' })
  @Column({ type: 'varchar', length: 1024, nullable: true })
  description: string;

  @ApiProperty({ example: 'Vintage & Antiques', description: 'The display name of the categories name' })
  @Column({ type: 'varchar', length: 24, default: 'Categories' })
  categoriesName: string;
  
  @ApiProperty({ example: 'brokenrecord.store', description: 'The ebay usr of the organization' })
  @Column({ nullable: true })
  ebayUser: string;

  @ApiProperty({ example: 'brokenrecord.store', description: 'The etsy usr of the organization' })
  @Column({ nullable: true })
  etsyShop: string;

  @ManyToOne(() => File, file => file.id)
  orgPhoto: File;

  /**
   * Other properties and relationships as needed
   */

  @ManyToOne(() => User, user => user.organizations)
  owner: User;

  // the currectly selected organization by a user
  @OneToMany(() => User, user => user.defaultOrganization, { nullable: true })
  defaultOrganizations: User[]

  // inventory
  @OneToMany(() => Inventory, inventory => inventory.organization, { nullable: true })
  inventory: Inventory[]

  // locations
  @OneToMany(() => Location, location => location.organization, { nullable: true })
  locations: Location[]

  // products
  @OneToMany(() => Product, product => product.organization, { nullable: true })
  products: Product[]

  // categories
  @OneToMany(() => Category, category => category.organization, { nullable: true })
  categories: Category[]

  // buckets
  @OneToMany(() => Bucket, bucket => bucket.organization, { nullable: true })
  buckets: Bucket[]

  // files
  @OneToMany(() => File, file => file.organization, { nullable: true })
  files: File[]

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