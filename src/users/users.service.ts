import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, Like as Likee } from 'typeorm';
import { User } from './user.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { Follow } from 'src/follows/follow.entity';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { OrderDto } from 'src/shared/dtos/order.dto';
import { Like } from 'src/like/like.entity';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
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

  findAll(
    pagination: PaginationDto,
    order: OrderDto,
    term?: string,
  ): Promise<[User[], number]> {
    const options: FindManyOptions<User> = {};

    if (term) {
      options.where = {
        username: Likee(`%${term}%`),
      };
    }

    if (order?.order) {
      options.order = { [order.order]: order.orderBy };
    } else {
      options.order = { created_at: 'DESC' };
    }
    if (pagination) {
      options.skip = pagination.skip;
      options.take = pagination.size;
    }

    return this.userRepo.findAndCount(options);
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

  async likePost(
    user: ActiveUserData,
    postId: uuid,
  ): Promise<Like | SuccessStatus> {
    const post = await this.postRepo.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('post not found!');
    }

    const alreadyLiked = await this.likeRepo.findOne({
      where: {
        userId: user.sub,
        postId: post.id,
      },
    });

    if (alreadyLiked) {
      await this.likeRepo.remove(alreadyLiked);
      return {
        message: 'Like has been removed!',
        status: 'successful',
      };
    }

    const currentUser = await this.userRepo.findOneBy({ id: user.sub });

    const like = this.likeRepo.create({
      post,
      user: currentUser,
    });

    return this.likeRepo.save(like);
  }

  async getProfile(user: ActiveUserData): Promise<User> {
    const currentUser = await this.userRepo.findOne({
      where: { id: user.sub },
    });

    return currentUser;
  }
}
