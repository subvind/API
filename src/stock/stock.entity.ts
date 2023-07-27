import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { Product } from '../products/product.entity';
import { Location } from '../locations/location.entity';

@Entity()
@Unique(['product', 'location']) 
export class Stock {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @ManyToOne(() => Location)
  @JoinColumn()
  location: Location;

  @Column()
  quantity: number;

  // Other properties and relationships as needed

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('before insert', this.id)
  }
}