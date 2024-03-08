import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Repository, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { OrderDto } from 'src/shared/dtos/order.dto';
import { Post } from 'src/posts/post.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  async getAllByPost(
    postId: uuid,
    pagination: PaginationDto,
    order: OrderDto,
  ): Promise<[Like[], number]> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found!');
    }

    const options: FindManyOptions<Like> = {};

    options.where = {
      postId,
    };

    if (order?.order) {
      options.order = { [order.order]: order.orderBy };
    } else {
      options.order = { created_at: 'DESC' };
    }

    if (pagination) {
      options.skip = pagination.skip;
      options.take = pagination.size;
    }

    options.relations = ['user'];

    return this.likeRepo.findAndCount(options);
  }

  async isLiked(user: ActiveUserData, postId: uuid): Promise<boolean> {
    const queryBuilder: SelectQueryBuilder<Like> =
      this.likeRepo.createQueryBuilder('like');

    const likeStatus = await queryBuilder
      .where('like.userId = :userId', { userId: user.sub })
      .andWhere('like.postId = :postId', { postId })
      .getOne();

    return !!likeStatus;
  }
}
