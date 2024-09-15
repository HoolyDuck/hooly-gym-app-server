import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { AuthService } from '../auth.service';
import { UserService } from '@/user/user.service';
import { User } from '@/user/schemas/user.schema';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser: User = {
    email: 'mockEmail',
    name: 'mockName',
    password: 'mockPassword',
    oauthAccounts: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user if email and password are valid', async () => {
    mockUserService.findByEmail.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await authService.validateUser(mockUser.email, 'password');

    expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(compare).toHaveBeenCalledWith('password', mockUser.password);
    expect(result).toEqual(mockUser);
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    mockUserService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.validateUser('invalid@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);

    expect(userService.findByEmail).toHaveBeenCalledWith('invalid@example.com');
    expect(compare).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    mockUserService.findByEmail.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.validateUser(mockUser.email, 'wrongPassword'),
    ).rejects.toThrow(UnauthorizedException);

    expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(compare).toHaveBeenCalledWith('wrongPassword', mockUser.password);
  });
});
