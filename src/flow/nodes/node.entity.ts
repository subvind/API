import { Entity, PrimaryColumn, Column, BeforeInsert, Unique } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { NodeKind } from './node-kind.enum';
import { NodeActive } from './node-active.enum';

@Entity()
@Unique(['identity']) 
export class Node {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  identity: string;

  @Column({ type: 'enum', enum: NodeKind, default: NodeKind.MAIN })
  kind: NodeKind;

  @Column()
  positionX: number;
  
  @Column()
  positionY: number;

  @Column({ default: 475 })
  dimensionWidth: number;

  @Column({ default: 25 })
  dimensionHeight: number;

  @Column({ default: 'black' })
  bgColor: string;

  @Column({ default: 'white' })
  textColor: string;

  @Column({ default: 'black' })
  borderColor: string;

  @Column({ type: 'enum', enum: NodeActive, default: NodeActive.FILES })
  active: NodeActive;

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('before insert', this.id)
  }
}