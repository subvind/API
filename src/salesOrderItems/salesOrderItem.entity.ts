import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { Product } from '../products/product.entity';
import { SalesOrder } from '../salesOrders/salesOrder.entity';

@Entity()
export class SalesOrderItem {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @ManyToOne(() => SalesOrder, (order) => order.items)
  order: SalesOrder;

  @Column()
  quantity: number;

  @Column()
  unitPrice: number;

  /**
   * Other properties and relationships as needed
   */

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('before insert', this.id)
  }
}
