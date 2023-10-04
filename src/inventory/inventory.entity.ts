import { Entity, Unique, PrimaryColumn, Column, BeforeInsert, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Location } from '../locations/location.entity';
import { Product } from '../products/product.entity';
import { Organization } from '../organizations/organization.entity';

export enum ItemStorageType {
  VOID = 'Void', // we don't know
  DISPLAY = 'Display', // item is on display
  PACKAGE = 'Package', // item is in a package ready for shipment
  CONTAINER = 'Container', // item needs to be packaged or put on display
}

export enum ProductStorageType {
  VOID = 'Void', // we don't know
  STORAGE_UNIT = 'Storage Unit', // product is in a storage unit
  SHIPPING_CONTAINER = 'Shipping Container', // product is in a shipping container
  VEHICLE = 'Vehicle', // product is in a car or truck
  WAREHOUSE = 'Warehouse', // product is in a warehouse
  STOREFRONT = 'Storefront', // product is at a store location
}

export enum ConditionType {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  NEW_OTHER = 'New Other',
  NEW_WITH_DEFECTS = 'New With Defects',
  MANUFACTURER_REFURBISHED = 'Manufacturer Refurbished',
  CERTIFIED_REFURBISHED = 'Cretified Refurbished',
  EXCELLENT_REFURBISHED = 'Excellent Refurbished',
  VERY_GOOD_REFURBISHED = 'Very Good Refurbished',
  GOOD_REFURBISHED = 'Good Refurbished',
  SELLER_REFURBISHED = 'Seller Refurbished',
  USED_EXCELLENT = 'Used Excellent',
  USED_VERY_GOOD = 'Used Very Good',
  USED_GOOD = 'Used Good',
  USED_ACCEPTABLE = 'Used Acceptable',
  FOR_PARTS_OR_NOT_WORKING = 'For Parts Or Not Working',
}

export enum PackageType {
  LETTER = 'Letter', // This enumeration value indicates that the package type used to ship the inventory item is a letter.
  BULKY_GOODS = 'Bulky Goods', // This enumeration value indicates that the inventory item is considered a "bulky good".
  CARAVAN = 'Caravan', // This enumeration value indicates that the package type used to ship the inventory item is a caravan.
  CARS = 'Cars', // This enumeration value indicates that the inventory item is a car
  EUROPALLET = 'Europallet', // This enumeration value indicates that the package type used to ship the inventory item is a Euro pallet.
  EXPANDABLE_TOUGH_BAGS = 'Expandable Tough Bags', // This enumeration value indicates that the package type used to ship the inventory item is an expandable tough bag.
  EXTRA_LARGE_PACK = 'Extra Large Pack', // This enumeration value indicates that the package type used to ship the inventory item is an extra large pack.
  FURNITURE = 'Furniture', // This enumeration value indicates that the inventory item is a furniture item.
  INDUSTRY_VEHICLES = 'Industry Vehicles', // This enumeration value indicates that the inventory item is an industry vehicle.
  LARGE_CANADA_POSTBOX = 'Large Canada Postbox', // This enumeration value indicates that the package type used to ship the inventory item is a Canada Post large box.
  LARGE_CANADA_POST_BUBBLE_MAILER = 'Large Canada Post Bubble Mailer', // This enumeration value indicates that the package type used to ship the inventory item is a Canada Post large bubble mailer.
  LARGE_ENVELOPE = 'Large Envelope', // This enumeration value indicates that the package type used to ship the inventory item is a large envelope.
  MAILING_BOX = 'Mailing Box', // This enumeration value indicates that the package type used to ship the inventory item is a standard mailing box.
  MEDIUM_CANADA_POST_BOX = 'Medium Canada Post Box', // This enumeration value indicates that the package type used to ship the inventory item is a medium Canada Post box.
  MEDIUM_CANADA_POST_BUBBLE_MAILER = 'Medium Canada Post Bubble Mailer', // This enumeration value indicates that the package type used to ship the inventory item is a medium Canada Post bubble mailer.
  MOTORBIKES = 'Motorbikes', // This enumeration value indicates that the inventory item is a motorcycle.
  ONE_WAY_PALLET = 'OneWay Pallet', // This enumeration value indicates that the package type used to ship the inventory item is a one-way pallet.
  PACKAGE_THICK_ENVELOPE = 'Package Thick Envelope', // This enumeration value indicates that the package type used to ship the inventory item is an thick envelope.
  PADDED_BAGS = 'Padded Bags', // This enumeration value indicates that the package type used to ship the inventory item is a padded bag.
  PARCEL_OR_PADDED_ENVELOPE = 'Parcel Or Padded Envelope', // This enumeration value indicates that the package type used to ship the inventory item is a parcel or a padded envelope.
  ROLL = 'Roll', // This enumeration value indicates that the package type used to ship the inventory item is a roll.
  SMALL_CANADA_POST_BOX = 'Small Canada Post Box', // This enumeration value indicates that the package type used to ship the inventory item is a small Canada Post box.
  SMALL_CANADA_POST_BUBBLE_MAILER = 'Small Canada Post Bubble Mailer', // This enumeration value indicates that the package type used to ship the inventory item is a small Canada Post bubble mailer.
  TOUGH_BAGS = 'Tough Bags', // This enumeration value indicates that the package type used to ship the inventory item is a a tough bag.
  UPS_LETTER = 'UPS Letter', // This enumeration value indicates that the package type used to ship the inventory item is a UPS letter.
  USPS_FLAT_RATE_ENVELOPE = 'USPS Flat Rate Envelope', // This enumeration value indicates that the package type used to ship the inventory item is a USPS flat-rate envelope.
  USPS_LARGE_PACK = 'USPS Large Pack', // This enumeration value indicates that the package type used to ship the inventory item is a USPS large pack.
  VERY_LARGE_PACK = 'Very Large Pack', // This enumeration value indicates that the package type used to ship the inventory item is a USPS very large pack.
  WINE_PAK = 'Wine Pak', // This enumeration value indicates that the package type used to ship the inventory item is a wine pak.
}

export enum LengthUnitOfMeasure {
  INCH = 'inch', // This enumeration value indicates that the dimensions of the shipping package is being measured in inches.
  FEET = 'feet', // This enumeration value indicates that the dimensions of the shipping package is being measured in feet.
  CENTIMETER = 'centimeter', // This enumeration value indicates that the dimensions of the shipping package is being measured in centimeters.
  METER = 'meter', // This enumeration value indicates that the dimensions of the shipping package is being measured in meters.
}

export enum WeightUnitOfMeasure {
  POUND = 'pound', // This enumeration value indicates that the unit of measurement used for measuring the weight of the shipping package is pounds.
  KILOGRAM = 'kilogram', // This enumeration value indicates that the unit of measurement used for measuring the weight of the shipping package is kilograms.
  OUNCE = 'ounce', // This enumeration value indicates that the unit of measurement used for measuring the weight of the shipping package is ounces.
  GRAM = 'gram', // This enumeration value indicates that the unit of measurement used for measuring the weight of the shipping package is grams.
}

@Entity()
export class Inventory {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '10', description: 'The number of items to keep' })
  @Column({ default: '1' })
  stock: number;

  @ApiProperty({ example: 'true', description: 'If this stock of items can be restored' })
  @Column({ default: 'false' })
  isRestockable: boolean;

  @ApiProperty({ example: '10', description: 'The quantity of items currently in stock' })
  @Column({ default: '1' })
  quantity: number;
  
  // OneToOne
  product: Product

  @ApiProperty({ example: 'Display', description: 'The item storage status of the inventory' })
  @Column({ default: 'Void' })
  itemStorageStatus: ItemStorageType;

  @ApiProperty({ example: 'Storefront', description: 'The product storage status of the inventory' })
  @Column({ default: 'Void' })
  productStorageStatus: ProductStorageType;

  @ApiProperty({ example: 'New', description: 'The condition of the item being stored' })
  @Column({ default: 'New' })
  condition: ConditionType;

  @ApiProperty({ example: 'Product is brand new.', description: 'The condition description of the item being stored' })
  @Column({ default: '' })
  conditionDescription: string;

  @ManyToOne(() => Location, location => location.id, { nullable: true })
  location: Location;

  @ApiProperty({ example: 'Mailing Box', description: 'The package type of the item being stored' })
  @Column({ default: 'Letter' })
  packageType: PackageType;

  @ApiProperty({ example: '10', description: 'The package dimensions length of the item being stored' })
  @Column({ default: '10' })
  packageDimensionsLength: number;

  @ApiProperty({ example: '10', description: 'The package dimensions width of the item being stored' })
  @Column({ default: '10' })
  packageDimensionsWidth: number;

  @ApiProperty({ example: '10', description: 'The package dimensions height of the item being stored' })
  @Column({ default: '10' })
  packageDimensionsHeight: number;

  @ApiProperty({ example: 'inch', description: 'The package dimensions unit of the item being stored' })
  @Column({ default: 'inch' })
  packageDimensionsUnit: LengthUnitOfMeasure;

  @ApiProperty({ example: '10', description: 'The package weight value of the item being stored' })
  @Column({ default: '1' })
  packageWeightValue: number;

  @ApiProperty({ example: 'ounce', description: 'The package weight unit of measure of the item being stored' })
  @Column({ default: 'pound' })
  packageWeightUnit: WeightUnitOfMeasure;

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
    console.log('inventory insert', this.id)
  }
}