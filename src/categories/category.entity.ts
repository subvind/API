import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Product } from '../products/product.entity';
import { Organization } from '../organizations/organization.entity';

@Entity()
@Unique(['stockKeepingUnit']) 
export class Category {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '001', description: 'The SKU that is used to identify this product' })
  @Column()
  name: string;

  @ApiProperty({ example: 'https://live.staticflickr.com/65535/53117641720_b5d5c8acfd_o.jpg', description: 'The photo URL of the product to display' })
  @Column({ nullable: true })
  slug: string;

  @ApiProperty({ example: '', description: 'The flickr album id to display' })
  @Column({ nullable: true })
  description: string;

  /**
   * Other properties and relationships as needed
   */

  // products
  @OneToMany(() => Product, product => product.category, { nullable: true })
  products: Product[]

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
