import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private apiKeysService: ApiKeysService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase(), active: true },
      relations: ['roles', 'merchant'],
    });
    if (!user) return null;
    if (!user.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!ok) return null;
    return user;
  }

  async login(email: string, password: string) {
    try {
      const user = await this.validateUser(email, password);
      if (!user) throw new UnauthorizedException('Email ou senha inválidos');
      return this.tokensForUser(user);
    } catch (err) {
      this.logger.error(`LOGIN_ERROR: ${err instanceof Error ? err.message : String(err)}`);
      if (err instanceof Error && err.stack) this.logger.error(err.stack);
      throw err;
    }
  }

  async tokensForUser(user: User) {
    const rolesList = Array.isArray(user.roles)
      ? user.roles.map((r) => (r && typeof r === 'object' && 'name' in r ? (r as { name: string }).name : null)).filter(Boolean) as string[]
      : [];
    const payload = {
      sub: user.id,
      email: user.email ?? '',
      merchantId: user.merchantId ?? undefined,
      roles: rolesList,
      type: 'user' as const,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.name ?? '',
        merchantId: user.merchantId ?? null,
        roles: rolesList,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify<{ sub: string; type: string }>(refreshToken);
      if (decoded.type !== 'refresh') throw new UnauthorizedException();
      const user = await this.userRepo.findOne({
        where: { id: decoded.sub, active: true },
        relations: ['roles', 'merchant'],
      });
      if (!user) throw new UnauthorizedException();
      return this.tokensForUser(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
