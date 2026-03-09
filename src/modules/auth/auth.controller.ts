import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AuthResponseDto, TokenResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new account',
    description: 'Creates a new user account and returns JWT tokens.',
  })
  @ApiCreatedResponse({
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email & password',
    description: 'Returns access token (15m) and refresh token (7d).',
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        path: '/api/v1/auth/login',
        method: 'POST',
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Pass the **refresh token** in `Authorization: Bearer <refreshToken>`. Returns a new pair of tokens (Refresh Token Rotation).',
  })
  @ApiBearerAuth('refresh-token')
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalid or expired' })
  refreshTokens(@CurrentUser('id') userId: string) {
    return this.authService.refreshTokens(userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description:
      'Invalidates the refresh token stored in DB. The access token will expire naturally.',
  })
  @ApiOkResponse({
    description: 'Logged out successfully',
    schema: {
      example: {
        success: true,
        data: { message: 'Logged out successfully' },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current user profile',
    schema: {
      example: {
        success: true,
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          fullName: 'John Doe',
          email: 'john@example.com',
          role: 'member',
          isActive: true,
          createdAt: '2024-01-15T09:00:00.000Z',
          updatedAt: '2024-01-15T09:00:00.000Z',
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Account is inactive' })
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
