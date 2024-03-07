import { IsNotEmpty, IsString } from 'class-validator';
import { Comment } from 'src/comments/comment.entity';
import { Like } from 'src/like/like.entity';
import { BaseEntity } from 'src/shared/database/base.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity()
export class Post extends BaseEntity {
  @Index()
  @Column({ unique: true })
  @IsString()
  title: string;

  @Column()
  @IsString()
  description: string;

  @Column({ nullable: true })
  @IsString()
  imageUrl: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @OneToMany(() => Comment, (comment) => comment.post, {
    nullable: true,
  })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post, {
    cascade: ['remove'],
  })
  likes: Like[];
}
