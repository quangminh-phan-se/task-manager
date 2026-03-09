import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from './jwt-access.strategy';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret')!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authHeader = req.get('Authorization');
    const rawRefreshToken = authHeader?.replace('Bearer ', '').trim();

    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied — please login again');
    }

    const isMatch = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      refreshToken: rawRefreshToken,
    };
  }
}
