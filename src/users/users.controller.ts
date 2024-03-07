import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { Serialize } from 'src/shared/interseptors/transformer.interseptor';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { Follow } from 'src/follows/follow.entity';
import { QueryPagination } from 'src/shared/decorators/query-pagination.decorator';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { QueryOrder } from 'src/shared/decorators/order-query.decorator';
import { OrderDto } from 'src/shared/dtos/order.dto';
import { Paginate } from 'src/shared/classes/paginate';
import { Like } from 'src/like/like.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('subscribe/:userId')
  subScribe(
    @Param('userId') userId: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Follow> {
    return this.usersService.subscribe(userId, user);
  }

  @Post('unsubscribe/:userId')
  unsubScribe(
    @Param('userId') userId: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<SuccessStatus> {
    return this.usersService.unSubscribe(userId, user);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Serialize(OutputUserDto)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('followers/by-user')
  async getFollowers(
    @ActiveUser() user: ActiveUserData,
    @QueryPagination() pagination: PaginationDto,
    @QueryOrder() order: OrderDto,
  ): Promise<Paginate<Follow>> {
    const [items, total] = await this.usersService.getFollowers(
      user,
      pagination,
      order,
    );

    return new Paginate(items, pagination.getPagination(total));
  }

  @Get('followings/by-user')
  async getFollowings(
    @ActiveUser() user: ActiveUserData,
    @QueryPagination() pagination: PaginationDto,
    @QueryOrder() order: OrderDto,
  ): Promise<Paginate<Follow>> {
    const [items, total] = await this.usersService.getFollowings(
      user,
      pagination,
      order,
    );

    return new Paginate(items, pagination.getPagination(total));
  }

  @Post('like/:postId')
  likePost(
    @ActiveUser() user: ActiveUserData,
    @Param('postId') postId: uuid,
  ): Promise<Like | SuccessStatus> {
    return this.usersService.likePost(user, postId);
  }
}
