import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
import { Role } from 'src/users/enums/role.enum';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { Post as Posts } from './post.entity';
import { GetWithPagination } from 'src/shared/decorators/get-with-pagination.decorator';
import { QueryPagination } from 'src/shared/decorators/query-pagination.decorator';
import { QueryOrder } from 'src/shared/decorators/order-query.decorator';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { OrderDto } from 'src/shared/dtos/order.dto';
import { Paginate } from 'src/shared/classes/paginate';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  createVideo(
    @Body() body: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Posts> {
    return this.postsService.create(body, user);
  }

  @GetWithPagination('')
  async getAll(
    @QueryPagination() pagination: PaginationDto,
    @QueryOrder() order: OrderDto,
    @Query('term') term: string,
  ): Promise<Paginate<Posts>> {
    const [items, total] = await this.postsService.getAll(
      pagination,
      order,
      term,
    );

    return new Paginate(items, pagination.getPagination(total));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.remove(id, user);
  }
}
