import { Column, Entity, OneToMany } from 'typeorm';
import { Role } from './enums/role.enum';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/shared/database/base.entity';
import { Follow } from 'src/follows/follow.entity';

@Entity()
export class User extends BaseEntity {
  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  username: string;

  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  password: string;

  @IsString()
  @Column({ nullable: true })
  profileImage: string;

  @Column({ enum: Role, default: Role.Regular })
  role: Role;

  @OneToMany(() => Follow, (follow) => follow.follower, {
    nullable: true,
    cascade: ['remove'],
  })
  followers: User[];

  @OneToMany(() => Follow, (follow) => follow.leader, {
    nullable: true,
    // cascade: true,
  })
  followings: User[];
}