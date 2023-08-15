import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Inventory } from '../inventory/inventory.entity';
import { Organization } from '../organizations/organization.entity';

@Entity()
@Unique(['stockKeepingUnit']) 
export class Product {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '001', description: 'The SKU that is used to identify this product' })
  @Column()
  stockKeepingUnit: string;

  @ApiProperty({ example: 'https://live.staticflickr.com/65535/53117641720_b5d5c8acfd_o.jpg', description: 'The photo URL of the product to display' })
  @Column()
  photoUrl: string;

  @ApiProperty({ example: '', description: 'The flickr album id to display' })
  @Column()
  flickrAlbum: string;

  @ApiProperty({ example: '', description: 'The ebay listing id to display' })
  @Column()
  ebayListing: string;

  @ManyToOne(() => Inventory, inventory => inventory.id)
  inventory: Inventory;

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
