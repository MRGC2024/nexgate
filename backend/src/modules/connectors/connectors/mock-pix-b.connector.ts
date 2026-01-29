import { v4 as uuidv4 } from 'uuid';
import type { PaymentConnector, CreatePaymentPayload, CreatePaymentResult, NormalizedWebhookEvent } from '../interfaces/payment-connector.interface';

export class MockPixBConnector implements PaymentConnector {
  readonly code = 'mock_pix_b';
  readonly name = 'Mock Pix B (alternativo)';
  readonly version = '1.0';
  readonly supportedMethods = ['pix'] as const;
  readonly configSchema = {
    type: 'object',
    properties: {
      token: { type: 'string', description: 'Token (mock B)' },
    },
  };

  async createPayment(_config: Record<string, unknown>, payload: CreatePaymentPayload): Promise<CreatePaymentResult> {
    const id = 'b-' + uuidv4();
    const expiresAt = new Date(Date.now() + (payload.expiresInMinutes || 30) * 60 * 1000);
    return {
      providerTransactionId: id,
      status: 'waiting_payment',
      pixQr: `00020126580014br.gov.bcb.pix0136${id}5204000053039865802BR5925NEXGATE MOCK B6009SAO PAULO62070503***6304`,
      pixCopyPaste: `00020126580014br.gov.bcb.pix0136${id}5204000053039865802BR5925NEXGATE MOCK B6009SAO PAULO62070503***6304`,
      expiresAt,
      raw: { mock: 'B', id },
    };
  }

  async getPayment(_config: Record<string, unknown>, _providerTransactionId: string): Promise<{ status: string; paidAt?: Date }> {
    return { status: 'waiting_payment' };
  }

  async refundPayment(_config: Record<string, unknown>, _providerTransactionId: string, _amountCents?: number): Promise<void> {
    // no-op
  }

  async parseWebhook(body: unknown): Promise<NormalizedWebhookEvent | null> {
    const b = body as Record<string, unknown>;
    if (b?.event === 'payment.paid' && b?.providerTransactionId) {
      return {
        providerTransactionId: b.providerTransactionId as string,
        event: 'transaction.paid',
        status: 'paid',
        paidAt: new Date(),
        payload: b,
      };
    }
    return null;
  }

  async healthCheck(_config: Record<string, unknown>): Promise<boolean> {
    return true;
  }
}
