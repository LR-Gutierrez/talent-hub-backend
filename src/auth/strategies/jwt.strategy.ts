import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'super-secret-key',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    permissions: string[];
  }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    const role = await this.rolesService.findByName(user.role);
    const permissions = role
      ? role.permissions.map((p) => p.name)
      : ['user:read', 'user:update'];

    return {
      userId: user.id,
      userName: user.displayName ?? user.email,
      email: user.email,
      role: user.role,
      authority: permissions,
      permissions,
      avatar: user.photoUrl,
    };
  }
}
