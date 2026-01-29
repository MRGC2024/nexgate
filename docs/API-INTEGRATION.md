# NEXGATE – Integração API

Documentação para integração via API pública (v1).

## Autenticação

Todas as requisições à API v1 devem enviar:

- **X-API-Key:** chave pública (ex.: `pk_...`)
- **X-API-Secret:** chave secreta (ex.: `sk_...`)

A chave secreta é exibida **apenas uma vez** na criação da API Key no painel. Guarde-a em variável de ambiente ou secrets.

## Base URL

- Desenvolvimento: `http://localhost:4000/api/v1`
- Produção: `https://api.nexgate.com/api/v1`

## Idempotência

Para `POST /v1/transactions`, envie o header opcional:

- **Idempotency-Key:** string única por cobrança (ex.: UUID). Se repetir a requisição com a mesma chave, o gateway retorna a mesma transação em vez de criar outra.

## Criar transação (Pix)

**POST** `/v1/transactions`

```json
{
  "amount_cents": 10000,
  "currency": "BRL",
  "payment_method": "pix",
  "external_ref": "pedido-123",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678909"
  },
  "items": [
    { "description": "Item 1", "quantity": 1, "amount_cents": 10000 }
  ],
  "metadata": { "order_id": "123" }
}
```

**Resposta (201):**

```json
{
  "transaction_id": "uuid",
  "status": "waiting_payment",
  "payment_method": "pix",
  "pix_qr": "00020126...",
  "pix_copy_paste": "00020126...",
  "expires_at": "2025-01-30T12:00:00.000Z",
  "created_at": "2025-01-30T11:30:00.000Z"
}
```

## Consultar transação

**GET** `/v1/transactions/:id`

Resposta inclui `id`, `status`, `amount_cents`, `paid_at`, etc.

## Cancelar transação

**POST** `/v1/transactions/:id/cancel`

Apenas transações em `created` ou `waiting_payment`.

## Estornar transação

**POST** `/v1/transactions/:id/refund`

Body opcional: `{ "amount_cents": 5000 }` para estorno parcial.

## Listar transações

**GET** `/v1/transactions?status=paid&payment_method=pix&limit=50`

Query params: `status`, `payment_method`, `limit`.

## Webhooks

Cadastre a URL no painel (Webhooks) e selecione os eventos. O gateway envia POST com:

**Headers:**

- `X-Event-Id` – ID único do evento
- `X-Timestamp` – Unix timestamp (anti-replay)
- `X-Signature` – HMAC-SHA256 de `timestamp + "." + body` (UTF-8)
- `Content-Type: application/json`

**Body (exemplo):**

```json
{
  "event": "transaction.paid",
  "transaction": {
    "id": "uuid",
    "merchant_id": "uuid",
    "amount_cents": 10000,
    "currency": "BRL",
    "payment_method": "pix",
    "status": "paid",
    "external_ref": "pedido-123",
    "paid_at": "2025-01-30T11:35:00.000Z"
  },
  "merchant_id": "uuid",
  "occurred_at": "2025-01-30T11:35:00.000Z"
}
```

**Validação da assinatura (exemplo em Node):**

```javascript
const crypto = require('crypto');
const payload = timestamp + '.' + body;
const expected = crypto.createHmac('sha256', WEBHOOK_SIGNING_SECRET).update(payload).digest('hex');
const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
```

Responda com **2xx** em até 30s. Caso contrário, o gateway fará retentativas (ex.: 1m, 5m, 15m, 1h, 6h).

## Exemplo cURL

```bash
curl -X POST https://api.nexgate.com/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_..." \
  -H "X-API-Secret: sk_..." \
  -H "Idempotency-Key: meu-pedido-123" \
  -d '{
    "amount_cents": 10000,
    "currency": "BRL",
    "payment_method": "pix",
    "external_ref": "pedido-123",
    "customer": { "name": "João", "email": "joao@email.com" }
  }'
```
