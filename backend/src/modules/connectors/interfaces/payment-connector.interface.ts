export interface CreatePaymentPayload {
  amountCents: number;
  currency: string;
  paymentMethod: 'pix' | 'boleto' | 'card';
  externalRef: string;
  customer?: { name?: string; email?: string; document?: string; phone?: string };
  items?: Array<{ description?: string; quantity?: number; amountCents?: number }>;
  metadata?: Record<string, unknown>;
  returnUrl?: string;
  postbackUrl?: string;
  expiresInMinutes?: number;
}

export interface CreatePaymentResult {
  providerTransactionId: string;
  status: string;
  pixQr?: string;
  pixCopyPaste?: string;
  expiresAt?: Date;
  boletoUrl?: string;
  boletoLine?: string;
  cardLast4?: string;
  cardBrand?: string;
  installments?: number;
  raw?: Record<string, unknown>;
}

export interface NormalizedWebhookEvent {
  providerTransactionId: string;
  event: string;
  status: string;
  paidAt?: Date;
  payload?: Record<string, unknown>;
}

export interface PaymentConnector {
  readonly code: string;
  readonly name: string;
  readonly version: string;
  readonly supportedMethods: readonly ('pix' | 'boleto' | 'card')[];
  readonly configSchema: Record<string, unknown>;

  createPayment(config: Record<string, unknown>, payload: CreatePaymentPayload): Promise<CreatePaymentResult>;
  getPayment(config: Record<string, unknown>, providerTransactionId: string): Promise<{ status: string; paidAt?: Date }>;
  refundPayment(config: Record<string, unknown>, providerTransactionId: string, amountCents?: number): Promise<void>;
  parseWebhook(body: unknown, headers?: Record<string, string>): Promise<NormalizedWebhookEvent | null>;
  healthCheck(config: Record<string, unknown>): Promise<boolean>;
}
