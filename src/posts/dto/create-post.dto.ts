import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(5, 200, { message: 'title must have more than 4 character' })
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  imageUrl: string;
}
