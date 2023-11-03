import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Organization } from '../organizations/organization.entity';
import { Playlist } from '../playlists/playlist.entity';
import { File } from '../files/file.entity';

@Entity()
@Unique(['slug', 'organization']) 
export class Video {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: 'my-video', description: 'The url slug that is used to identify this video' })
  @Column()
  slug: string;

  @ApiProperty({ example: '', description: 'The title of the video' })
  @Column({ default: 'my video' })
  title: string;

  @ApiProperty({ example: '', description: 'The short description about the video' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: '', description: 'The thumbnail url of the video' })
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ManyToOne(() => File, file => file.id)
  thumbnail: File;

  @ApiProperty({ example: '', description: 'The rumble watch id of the video' })
  @Column({ nullable: true })
  rumbleWatchId: string;

  @ApiProperty({ example: '', description: 'The youtube watch id of the video' })
  @Column({ nullable: true })
  youtubeWatchId: string;

  @ApiProperty({ example: '2000', description: 'The number of views that this video has' })
  @Column({ default: 0 })
  views: number;

  /**
   * Other properties and relationships as needed
   */

  // playlist
  @ManyToOne(() => Playlist, playlist => playlist.id)
  playlist: Playlist;

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
    console.log('video insert', this.id)
  }
}
