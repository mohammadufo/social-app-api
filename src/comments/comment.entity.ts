import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Post } from 'src/posts/post.entity';
import { BaseEntity } from 'src/shared/database/base.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Max(5)
  @Min(0)
  rate: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  @IsString()
  @IsNotEmpty()
  postId: string;
}
