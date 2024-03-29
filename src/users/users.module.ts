import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Follow } from 'src/follows/follow.entity';
import { Post } from 'src/posts/post.entity';
import { Comment } from 'src/comments/comment.entity';
import { Like } from 'src/like/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Post, Comment, Like])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
