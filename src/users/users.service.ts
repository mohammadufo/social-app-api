import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { User } from './user.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { Follow } from 'src/follows/follow.entity';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { OrderDto } from 'src/shared/dtos/order.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
  ) {}

  async subscribe(id: string, user: ActiveUserData): Promise<Follow> {
    const channel = await this.userRepo.findOne({
      where: { id },
    });
    if (!channel) {
      throw new NotFoundException('User Not Found!');
    }

    const alreadyFollowed = await this.followRepo.findOne({
      where: {
        leaderId: id,
        followerId: user.sub,
      },
    });

    if (alreadyFollowed) {
      throw new BadRequestException('User Already followed!');
    }

    const currentUser = await this.userRepo.findOne({
      where: { id: user.sub },
    });

    const result = this.followRepo.create({
      follower: currentUser,
      leader: channel,
    });

    return await this.followRepo.save(result);
  }

  async unSubscribe(id: string, user: ActiveUserData): Promise<SuccessStatus> {
    const channel = await this.userRepo.findOne({
      where: { id },
    });
    if (!channel) {
      throw new NotFoundException('User Not Found!');
    }

    const alreadyFollowed = await this.followRepo.findOne({
      where: {
        leaderId: id,
        followerId: user.sub,
      },
    });

    if (!alreadyFollowed) {
      throw new BadRequestException('You are not following this user!');
    }

    await this.followRepo.remove(alreadyFollowed);

    return {
      message: 'user has unFollowed!',
      status: 'successful',
    };
  }

  async getFollowers(
    user: ActiveUserData,
    pagination: PaginationDto,
    order: OrderDto,
  ): Promise<[Follow[], number]> {
    const options: FindManyOptions<Follow> = {};

    options.where = {
      leaderId: user.sub,
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

    options.relations = ['follower'];

    return this.followRepo.findAndCount(options);
  }

  async getFollowings(
    user: ActiveUserData,
    pagination: PaginationDto,
    order: OrderDto,
  ): Promise<[Follow[], number]> {
    const options: FindManyOptions<Follow> = {};

    options.where = {
      followerId: user.sub,
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

    options.relations = ['leader'];

    return this.followRepo.findAndCount(options);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
