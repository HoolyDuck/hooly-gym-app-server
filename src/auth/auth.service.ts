import { User } from '@/user/schemas/user.schema';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> | never {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async validateJwtUser(userId: string): Promise<User> | never {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return user;
  }

  async login(user: User): Promise<{ accessToken: string }> {
    return { accessToken: this.#generateToken(user) };
  }

  async register(registerDto: RegisterDto): Promise<User> | never {
    const user = await this.userService.findByEmail(registerDto.email);
    if (user) throw new UnauthorizedException('User already exists');

    const createdUser = await this.userService.create(registerDto);
    return createdUser;
  }

  #generateToken(user: User): string {
    const payload = { sub: user._id };
    return this.jwtService.sign(payload);
  }
}
