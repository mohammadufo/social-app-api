import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Post } from 'src/posts/post.entity';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Post])],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
