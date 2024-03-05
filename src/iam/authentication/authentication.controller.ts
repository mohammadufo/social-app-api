import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { refreshTokenDto } from './dto/refresh-token.dto';

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('sign-up')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: refreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
