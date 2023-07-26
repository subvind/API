import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { NodeType } from './node-type.entity'

@Entity()
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  identity: string;

  @Column()
  kind: string;

  @Column()
  positionX: number;
  
  @Column()
  positionY: number;

  @Column()
  dimensionWidth: number;

  @Column()
  dimensionHeight: number;

  @Column()
  bgColor: string;

  @Column()
  textColor: string;

  @Column()
  borderColor: string;

  @ManyToOne(() => NodeType, (nodeType) => nodeType.nodes)
  active: NodeType
}