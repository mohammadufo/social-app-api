import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './follow.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { OrderDto } from 'src/shared/dtos/order.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getAll(
    pagination: PaginationDto,
    order: OrderDto,
  ): Promise<[Follow[], number]> {
    const options: FindManyOptions<Follow> = {};

    if (order?.order) {
      options.order = { [order.order]: order.orderBy };
    } else {
      options.order = { created_at: 'DESC' };
    }
    if (pagination) {
      options.skip = pagination.skip;
      options.take = pagination.size;
    }

    options.relations = ['follower', 'leader'];

    return this.followRepo.findAndCount(options);
  }

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

    const result = this.followRepo.create({
      follower: user,
      leader: channel,
    });

    return await this.followRepo.save(result);
  }
}
