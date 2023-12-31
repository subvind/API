import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';

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
import { Showcase } from '../showcases/showcase.entity'
import { Account } from '../accounts/account.entity'
import { Video } from '../videos/video.entity';
import { Playlist } from '../playlists/playlist.entity';

@Entity()
@Unique(['orgname'])
@Unique(['frontendHostname'])
@Unique(['backendHostname'])
@Unique(['homeHostname'])
@Unique(['erpHostname'])
@Unique(['tubeHostname'])
@Unique(['deskHostname'])
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

  @ApiProperty({ example: 'istrav.com', description: 'The main or frontend hostname of the organization' })
  @Column({ type: 'varchar', length: 256, nullable: true })
  frontendHostname: string;

  @ApiProperty({ example: 'subvind.com', description: 'The admin or backend hostname of the organization' })
  @Column({ type: 'varchar', length: 256, nullable: true })
  backendHostname: string;

  @ApiProperty({ example: 'false', description: 'The home module enabled of the organization' })
  @Column({ default: true })
  isHomeModule: boolean;
  
  @ApiProperty({ example: 'false', description: 'The erp module enabled of the organization' })
  @Column({ default: true })
  isErpModule: boolean;

  @ApiProperty({ example: 'false', description: 'The tube module enabled of the organization' })
  @Column({ default: true })
  isTubeModule: boolean;

  @ApiProperty({ example: 'false', description: 'The desk module enabled of the organization' })
  @Column({ default: true })
  isDeskModule: boolean;

  @ApiProperty({ example: 'www.istrav.com', description: 'The home hostname of the organization' })
  @Column({ type: 'varchar', length: 256, nullable: true })
  homeHostname: string;

  @ApiProperty({ example: 'store.istrav.com', description: 'The erp hostname of the organization' })
  @Column({ type: 'varchar', length: 256, nullable: true })
  erpHostname: string;

  @ApiProperty({ example: 'videos.istrav.com', description: 'The tube hostname of the organization' })
  @Column({ type: 'varchar', length: 256, nullable: true })
  tubeHostname: string;

  @ApiProperty({ example: 'client-area.istrav.com', description: 'The desk hostname of the organization' })
  @Column({ type: 'varchar', length: 256, nullable: true })
  deskHostname: string;

  @ApiProperty({ example: 'ACME Corp.', description: 'The display name of the organization' })
  @Column()
  displayName: string;

  @ApiProperty({ example: 'ACME', description: 'The short name of the organization' })
  @Column({ type: 'varchar', length: 16, nullable: true })
  shortName: string;

  @ApiProperty({ example: 'Vintage & Antiques', description: 'The description of the organization' })
  @Column({ type: 'varchar', length: 1024, nullable: true })
  description: string;
  
  @ApiProperty({ example: `[{ "icon": "home", "name": "Homepage", "url": "https://www.istrav.com" }]`, description: 'The menu of the organization' })
  @Column('json', { nullable: true })
  menu: { icon: string; name: string; url: string }[];

  @ApiProperty({ example: '<p>Hello World!</p>', description: 'The about of the organization' })
  @Column({ nullable: true })
  about: string;

  @ApiProperty({ example: 'brokenrecord.store', description: 'The ebay usr of the organization' })
  @Column({ nullable: true })
  ebayUser: string;

  @ApiProperty({ example: 'brokenrecord.store', description: 'The etsy usr of the organization' })
  @Column({ nullable: true })
  etsyShop: string;

  @ApiProperty({ example: 'brokenrecord.store', description: 'The youtube channel of the organization' })
  @Column({ nullable: true })
  youtubeChannel: string;

  @ApiProperty({ example: 'brokenrecord.store', description: 'The twitter user of the organization' })
  @Column({ nullable: true })
  twitterUser: string;

  @ApiProperty({ example: 'brokenrecord.store', description: 'The github user of the organization' })
  @Column({ nullable: true })
  githubUser: string;

  @ManyToOne(() => File, file => file.id)
  orgPhoto: File;

  @ManyToOne(() => File, file => file.id)
  splashPhoto: File;

  @ApiProperty({ example: 'false', description: 'Turn on and off branding' })
  @Column({ default: true })
  isBranding: boolean;

  @ApiProperty({ example: '/', description: 'The homepage url link of the organization' })
  @Column({ nullable: true })
  homepageLink: string;

  @ApiProperty({ example: 'www.brokenrecord.store@gmail.com', description: 'The contact center email of the organization' })
  @Column({ nullable: true })
  contactCenterEmail: string;

  @ApiProperty({ example: 'Everyone needs to respect one another.', description: 'The privacy policy of the organization' })
  @Column({ nullable: true })
  privacyPolicy: string;

  @ApiProperty({ example: 'Everyone needs to behave.', description: 'The terms and conditions of the organization' })
  @Column({ nullable: true })
  termsAndConditions: string;

  @ApiProperty({ example: 'wefljfjjkjuqqbfjjdsdkjc', description: 'The ebay access token of the organization' })
  @Column({ nullable: true })
  ebayAccessToken: string;

  /**
   * Other properties and relationships as needed
   */
  // sub organizations
  @ManyToMany(() => Organization, organization => organization.parentOrganizations, { nullable: true })
  subOrganizations: Organization[]
  @ManyToMany(() => Organization, organization => organization.subOrganizations, { nullable: true })
  @JoinTable()
  parentOrganizations: Organization[];

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

  // showcases
  @OneToMany(() => Showcase, showcase => showcase.organization, { nullable: true })
  showcases: Showcase[]

  // accounts
  @OneToMany(() => Account, account => account.organization, { nullable: true })
  accounts: Account[]

  // playlists
  @OneToMany(() => Playlist, playlist => playlist.organization, { nullable: true })
  playlists: Playlist[]

  // videos
  @OneToMany(() => Video, video => video.organization, { nullable: true })
  videos: Video[]

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('organization insert', this.id)
  }
}