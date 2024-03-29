import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { pgUniqueViolationErrorCode } from 'src/shared/constant/error.constatnts';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user.interface';
import { refreshTokenDto } from './dto/refresh-token.dto';
import {
  RefreshTokenIdsStorage,
  InvalidateRefreshTokenError,
} from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(data: SignUpDto) {
    try {
      const user = new User();
      user.email = data.email;
      user.username = data.username;
      user.password = await this.hashingService.hash(data.password);

      await this.userRepo.save(user);
    } catch (error) {
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException();
      }
      throw error;
    }
  }

  async signIn(data: SignInDto) {
    const user = await this.userRepo.findOneBy({
      email: data.email,
    });

    if (!user) {
      throw new UnauthorizedException('This user not exists!');
    }

    const isEqual = await this.hashingService.compare(
      data.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Email or password is not match!');
    }

    return await this.generateTokens(user);
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      await this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokeTtl,
        { email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    await this.refreshTokenStorage.insert(user.id, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: refreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userRepo.findOneByOrFail({ id: sub });

      const isValid = await this.refreshTokenStorage.validate(
        user.id,
        refreshTokenId,
      );
      if (isValid) {
        await this.refreshTokenStorage.invalidate(user.id);
      } else {
        throw new UnauthorizedException('Refresh Token is Invalid !💥');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidateRefreshTokenError) {
        throw new UnauthorizedException('Access denied 💥');
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
