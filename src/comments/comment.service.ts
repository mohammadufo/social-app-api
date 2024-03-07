import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from '../users/user.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  async create(body: CreateCommentDto, user: ActiveUserData) {
    const comment = this.commentRepo.create(body);

    const currentUser = await this.userRepo.findOne({
      where: { id: user.sub },
    });

    const post = await this.postRepo.findOne({
      where: { id: body.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found!');
    }

    comment.author = currentUser;
    comment.post = post;

    return await this.commentRepo.save(comment);
  }

  async getAll() {
    return this.commentRepo.find({
      relations: {
        post: true,
        author: true,
      },
    });
  }
}
