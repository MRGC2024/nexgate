import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSigningService {
  private secret: string;

  constructor(private config: ConfigService) {
    this.secret = this.config.get('WEBHOOK_SIGNING_SECRET') || 'nexgate-webhook-secret-change-in-prod';
  }

  sign(payload: string, timestamp: string): string {
    return crypto.createHmac('sha256', this.secret).update(`${timestamp}.${payload}`).digest('hex');
  }

  verify(payload: string, timestamp: string, signature: string): boolean {
    const expected = this.sign(payload, timestamp);
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  }

  getHeaders(payload: string): { 'X-Event-Id': string; 'X-Timestamp': string; 'X-Signature': string } {
    const eventId = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.sign(payload, timestamp);
    return {
      'X-Event-Id': eventId,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    };
  }
}
