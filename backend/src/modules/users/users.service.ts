import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  async create(data: {
    email: string;
    password: string;
    name: string;
    merchantId?: string | null;
    roleNames?: string[];
  }): Promise<User> {
    const email = data.email.toLowerCase();
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email já cadastrado');
    const roles = data.roleNames?.length
      ? await this.roleRepo.find({ where: { name: In(data.roleNames) } })
      : [];
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = this.userRepo.create({
      email,
      passwordHash,
      name: data.name,
      merchantId: data.merchantId ?? undefined,
      roles,
    });
    return this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: ['roles', 'merchant'],
    });
  }

  async findOne(id: string): Promise<User> {
    const u = await this.userRepo.findOne({
      where: { id },
      relations: ['roles', 'merchant'],
    });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return u;
  }

  async findAll(merchantId?: string): Promise<User[]> {
    const where = merchantId ? { merchantId } : {};
    return this.userRepo.find({
      where,
      relations: ['roles', 'merchant'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateRoles(userId: string, roleNames: string[]): Promise<User> {
    const user = await this.findOne(userId);
    const roles = await this.roleRepo.find({ where: { name: In(roleNames) } });
    user.roles = roles;
    return this.userRepo.save(user);
  }
}
