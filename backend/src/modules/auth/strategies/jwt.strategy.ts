import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'nexgate-jwt-secret-change-in-prod',
    });
  }

  async validate(payload: { sub: string; email: string; merchantId?: string; roles?: string[] }): Promise<JwtPayload> {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub, active: true },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException();
    return {
      sub: user.id,
      email: user.email,
      merchantId: user.merchantId ?? undefined,
      roles: user.roles?.map((r) => r.name) ?? [],
      type: 'user',
    };
  }
}
