import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { User } from '@/user/schemas/user.schema';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@GetUser() user: User, @Res() res: Response): Promise<void> {
    const { accessToken } = await this.authService.login(user);
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.send(user);
  }

  @Get('authenticate')
  @UseGuards(JwtAuthGuard)
  async authenticate(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    res.clearCookie('accessToken');
    res.send();
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @GetUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const { accessToken } = await this.authService.login(user);
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.redirect('http://localhost:3000');
  }
}
