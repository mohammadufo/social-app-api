import { Controller, Get, Param } from '@nestjs/common';
import { Like } from './like.entity';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { OrderDto } from 'src/shared/dtos/order.dto';
import { QueryPagination } from 'src/shared/decorators/query-pagination.decorator';
import { Paginate } from 'src/shared/classes/paginate';
import { QueryOrder } from 'src/shared/decorators/order-query.decorator';
import { LikeService } from './like.service';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('like')
export class LikeController {
  constructor(private readonly LikeService: LikeService) {}

  @Get(':postId')
  async getAllByPost(
    @Param('postId') postId: uuid,
    @QueryPagination() pagination: PaginationDto,
    @QueryOrder() order: OrderDto,
  ): Promise<Paginate<Like>> {
    const [items, total] = await this.LikeService.getAllByPost(
      postId,
      pagination,
      order,
    );

    return new Paginate(items, pagination.getPagination(total));
  }

  @Get('isliked/:postId')
  async isLiked(
    @ActiveUser() user: ActiveUserData,
    @Param('postId') postId: uuid,
  ): Promise<boolean> {
    return this.LikeService.isLiked(user, postId);
  }
}
