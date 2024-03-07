import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/shared/database/base.entity';
import { User } from 'src/users/user.entity';
import { Post } from 'src/posts/post.entity';

@Entity()
export class Like extends BaseEntity {
  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  @IsString()
  @IsNotEmpty()
  postId: string;
}
