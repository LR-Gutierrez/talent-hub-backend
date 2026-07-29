import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(
    @Body() dto: { email: string; password: string },
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.signIn(dto.email, dto.password);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { user: result.user };
  }

  @Post('sign-up')
  async signUp(
    @Body() dto: { email: string; password: string; displayName?: string },
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.signUp(
      dto.email,
      dto.password,
      dto.displayName,
    );
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { user: result.user };
  }

  @Post('sign-out')
  signOut(@Res({ passthrough: true }) res: any) {
    res.clearCookie('token', { path: '/' });
    return { message: 'Signed out' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }
}
