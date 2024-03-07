import { Expose, Type } from 'class-transformer';
import { Post } from 'src/posts/post.entity';
import { OutputUserDto } from 'src/users/dto/output-user.dto';

export class outputPostDto extends Post {
  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  id: string;
}

export class OutputCommentDto {
  @Expose()
  rate: number;

  @Expose()
  content: string;

  @Expose()
  postId: string;

  @Expose()
  @Type(() => outputPostDto)
  post: outputPostDto;

  @Expose()
  authorId: string;

  @Expose()
  @Type(() => OutputUserDto)
  author: OutputUserDto;
}
