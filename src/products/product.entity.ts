import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Inventory } from '../inventory/inventory.entity';
import { Organization } from '../organizations/organization.entity';
import { Category } from '../categories/category.entity';
import { Bucket } from '../buckets/bucket.entity';
import { File } from '../files/file.entity';

@Entity()
@Unique(['stockKeepingUnit', 'organization']) 
export class Product {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '001', description: 'The SKU that is used to identify this product' })
  @Column()
  stockKeepingUnit: string;

  @OneToOne(() => Inventory, { eager: true, cascade: true })
  @JoinColumn()
  inventory: Inventory;

  @ApiProperty({ example: '', description: 'The name of the product' })
  @Column({ default: 'my product' })
  name: string;

  @ApiProperty({ example: '', description: 'The short description about the product' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: '', description: 'The long detail about the product' })
  @Column({ nullable: true })
  detail: string;

  @ManyToOne(() => File, file => file.id)
  coverPhoto: File;

  @ManyToOne(() => Bucket, bucket => bucket.id)
  bucket: Bucket;

  @ApiProperty({ example: '', description: 'The ebay item id to display' })
  @Column({ nullable: true })
  ebayItem: string;

  @ApiProperty({ example: '', description: 'The etsy item id to display' })
  @Column({ nullable: true })
  etsyItem: string;

  @ManyToOne(() => Inventory, inventory => inventory.id)
  inventory: Inventory;

  @ApiProperty({ example: 'true', description: 'If this product has been archived' })
  @Column({ default: 'false' })
  isArchive: boolean;

  @ApiProperty({ example: '2000', description: 'The price of this product in pennies.' })
  @Column({ default: 2000 })
  price: number;

  @ApiProperty({ example: '500', description: 'The shipping cost of this product in pennies.' })
  @Column({ default: 500 })
  shippingCost: number;

  /**
   * Other properties and relationships as needed
   */

  // category
  @ManyToOne(() => Category, category => category.id)
  category: Category;

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
    console.log('product insert', this.id)
  }
}
