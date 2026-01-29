import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private dataSource: DataSource) {}

  async check(): Promise<{ status: string; database?: string; redis?: string }> {
    const result: { status: string; database?: string; redis?: string } = { status: 'ok' };
    try {
      await this.dataSource.query('SELECT 1');
      result.database = 'ok';
    } catch (e) {
      result.database = 'error';
      result.status = 'degraded';
    }
    return result;
  }

  async ready(): Promise<{ ready: boolean }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { ready: true };
    } catch {
      return { ready: false };
    }
  }
}
