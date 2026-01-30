import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Role } from '../users/entities/role.entity';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
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

  /** Registro público: cria Merchant (pending_approval) + User com role merchant_admin */
  async register(dto: { name: string; document: string; email: string; phone: string; password: string }) {
    const emailLower = dto.email.trim().toLowerCase();
    const existingUser = await this.userRepo.findOne({ where: { email: emailLower } });
    if (existingUser) throw new ConflictException('Este e-mail já está cadastrado.');

    const baseSlug = dto.name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 30) || 'empresa';
    const docSuffix = (dto.document || '').replace(/\D/g, '').slice(-6) || crypto.randomBytes(3).toString('hex');
    let slug = `${baseSlug}-${docSuffix}`;
    let exists = await this.merchantRepo.findOne({ where: { slug } });
    while (exists) {
      slug = `${baseSlug}-${docSuffix}-${crypto.randomBytes(2).toString('hex')}`;
      exists = await this.merchantRepo.findOne({ where: { slug } });
    }

    const docDigits = dto.document.replace(/\D/g, '');
    const phoneDigits = (dto.phone || '').replace(/\D/g, '');
    const merchantData: Partial<Merchant> = {
      slug,
      name: dto.name.trim(),
      document: docDigits || undefined,
      email: emailLower,
      phone: phoneDigits || undefined,
      active: false,
      registrationStatus: 'pending_approval',
    };
    const merchant = this.merchantRepo.create(merchantData);
    await this.merchantRepo.save(merchant);

    const merchantAdminRole = await this.roleRepo.findOne({ where: { name: 'merchant_admin' } });
    if (!merchantAdminRole) throw new ConflictException('Sistema em configuração. Tente mais tarde.');

    const userName = dto.name.trim().slice(0, 100) || emailLower.split('@')[0];
    const newUser = this.userRepo.create({
      email: emailLower,
      passwordHash: await bcrypt.hash(dto.password, 12),
      name: userName,
      merchantId: merchant.id,
      active: true,
    });
    newUser.roles = [merchantAdminRole];
    await this.userRepo.save(newUser);

    this.logger.log(`Register: merchant ${merchant.id} (${slug}), user ${newUser.id}`);
    return { message: 'Conta criada com sucesso. Aguarde a aprovação do cadastro para acessar o painel.' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    const ok = await bcrypt.compare(currentPassword, user.passwordHash).catch(() => false);
    if (!ok) throw new UnauthorizedException('Senha atual incorreta');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.save(user);
    this.logger.log(`Password changed for user ${userId}`);
    return { message: 'Senha alterada com sucesso.' };
  }
}
