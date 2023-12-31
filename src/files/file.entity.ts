import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Organization } from '../organizations/organization.entity';
import { Bucket } from '../buckets/bucket.entity';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { Showcase } from '../showcases/showcase.entity';
import { Video } from '../videos/video.entity';
import { Playlist } from '../playlists/playlist.entity';

@Entity()
@Unique(['filename', 'organization']) 
export class File {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: 'my-file.txt', description: 'The name of the file' })
  @Column({ default: 'my-file.txt' })
  filename: string;

  @ApiProperty({ example: '500', description: 'The width of the image file' })
  @Column({ default: 500 })
  width: number;

  @ApiProperty({ example: '500', description: 'The height of the image file' })
  @Column({ default: 500 })
  height: number;

  // category
  @ManyToOne(() => Bucket, bucket => bucket.id)
  bucket: Bucket;

  // coverPhotos
  @OneToMany(() => Product, product => product.coverPhoto, { nullable: true })
  coverPhotos: Product[]

  // orgPhotos
  @OneToMany(() => Organization, organization => organization.orgPhoto, { nullable: true })
  orgPhotos: Organization[]

  // splashPhotos
  @OneToMany(() => Organization, organization => organization.splashPhoto, { nullable: true })
  splashPhotos: Organization[]

  // mainPhotos
  @OneToMany(() => Category, category => category.mainPhoto, { nullable: true })
  mainPhotos: Category[]

  // bannerPhotos
  @OneToMany(() => Showcase, showcase => showcase.bannerPhoto, { nullable: true })
  bannerPhotos: Showcase[]

  // playlistPhotos
  @OneToMany(() => Playlist, playlist => playlist.playlistPhoto, { nullable: true })
  playlistPhotos: Playlist[]

  // thumbnails
  @OneToMany(() => Video, video => video.thumbnail, { nullable: true })
  thumbnails: Video[]

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
    console.log('file insert', this.id)
  }
}
