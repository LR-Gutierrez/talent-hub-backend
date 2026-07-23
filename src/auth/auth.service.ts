import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        userId: user.id,
        userName: user.displayName ?? user.email,
        email: user.email,
        authority: [user.role],
        avatar: user.photoUrl ?? null,
      },
    };
  }

  async signUp(email: string, password: string, displayName?: string) {
    const user = await this.usersService.create({ email, password, displayName });
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        userId: user.id,
        userName: user.displayName ?? user.email,
        email: user.email,
        authority: [user.role],
        avatar: null,
      },
    };
  }
}
