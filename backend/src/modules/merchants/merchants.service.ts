import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
  ) {}

  async create(data: Partial<Merchant>): Promise<Merchant> {
    const slug = (data.slug || data.name?.toLowerCase().replace(/\s+/g, '-')) as string;
    const exists = await this.merchantRepo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('Merchant com este slug já existe');
    const entity = this.merchantRepo.create({ ...data, slug });
    return this.merchantRepo.save(entity);
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Merchant> {
    const m = await this.merchantRepo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Merchant não encontrado');
    return m;
  }

  async findBySlug(slug: string): Promise<Merchant | null> {
    return this.merchantRepo.findOne({ where: { slug } });
  }

  async update(id: string, data: Partial<Merchant>): Promise<Merchant> {
    const m = await this.findOne(id);
    Object.assign(m, data);
    return this.merchantRepo.save(m);
  }

  async remove(id: string): Promise<void> {
    const m = await this.findOne(id);
    await this.merchantRepo.remove(m);
  }

  async getFullDetail(id: string): Promise<{
    merchant: Merchant;
    transactions: Transaction[];
    transactionCount: number;
  }> {
    const merchant = await this.findOne(id);
    const [transactions, transactionCount] = await this.txRepo.findAndCount({
      where: { merchantId: id },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return { merchant, transactions, transactionCount };
  }
}
