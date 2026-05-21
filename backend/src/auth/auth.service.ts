import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleCode } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser, JwtPayload } from './jwt-payload.interface';

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    const created = await this.users.create({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      phone: dto.phone,
      roles: dto.roles,
    });
    return this.buildToken(created.user.id, created.user.email, created.user.fullName, created.roleCodes);
  }

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const found = await this.users.findByEmail(dto.email);
    if (!found || !found.user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const ok = await bcrypt.compare(dto.password, found.user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildToken(found.user.id, found.user.email, found.user.fullName, found.roleCodes);
  }

  private buildToken(
    userId: string,
    email: string,
    fullName: string,
    roles: RoleCode[],
  ): AuthTokenResponse {
    const payload: JwtPayload = { sub: userId, email, roles };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
      user: { id: userId, email, fullName, roles },
    };
  }
}
