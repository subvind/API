import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Video } from '../videos/video.entity';
import { Organization } from '../organizations/organization.entity';
import { File } from '../files/file.entity';

@Entity()
@Unique(['slug', 'organization']) 
export class Playlist {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: 'My Playlist', description: 'The name this playlist' })
  @Column()
  name: string;

  @ApiProperty({ example: 'my-playlist', description: 'The slug that is used to identify this playlist' })
  @Column({ nullable: true })
  slug: string;

  @ApiProperty({ example: '', description: 'The description of this playlist' })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => File, file => file.id)
  playlistPhoto: File;

  /**
   * Other properties and relationships as needed
   */

  // sub playlists
  @OneToMany(() => Playlist, playlist => playlist.parentPlaylist, { nullable: true })
  subPlaylists: Playlist[]
  @ManyToOne(() => Playlist, playlist => playlist.id)
  parentPlaylist: Playlist;

  // videos
  @OneToMany(() => Video, video => video.playlist, { nullable: true })
  videos: Video[]

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
    console.log('playlist insert', this.id)
  }
}
