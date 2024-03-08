import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { OrderDto } from 'src/shared/dtos/order.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(body: CreatePostDto, user: ActiveUserData): Promise<Post> {
    const post = this.postRepo.create(body);

    const currentUser = await this.userRepo.findOne({
      where: { id: user.sub },
    });

    post.user = currentUser;

    return await this.postRepo.save(post);
  }

  async getAll(
    pagination: PaginationDto,
    order: OrderDto,
    term?: string,
  ): Promise<[Post[], number]> {
    const options: FindManyOptions<Post> = {};

    if (term) {
      options.where = {
        title: Like(`%${term}%`),
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

    options.relations = ['user'];

    return this.postRepo.findAndCount(options);
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: string): Promise<Post> {
    return this.postRepo.findOne({
      where: { id },
      relations: {
        user: true,
        comments: true,
      },
    });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
