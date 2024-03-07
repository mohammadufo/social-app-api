import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentService } from './comment.service';
import { Serialize } from 'src/shared/interseptors/transformer.interseptor';
import { OutputCommentDto } from './dtos/output-comment.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  createComment(
    @Body() body: CreateCommentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.commentService.create(body, user);
  }

  @Get()
  @Serialize(OutputCommentDto)
  getAllComments() {
    return this.commentService.getAll();
  }
}
