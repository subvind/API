import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { Product } from '../products/product.entity';

@Entity()
export class ProductionOrder {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column()
  quantity: number;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  /**
   * Other properties and relationships as needed
   */

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('productionOrder insert', this.id)
  }
}