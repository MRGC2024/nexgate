# NEXGATE – Gateway/Orquestrador de Pagamentos

Gateway/orquestrador de pagamentos white-label, multi-tenant, com API unificada (Pix, boleto, cartão), conectores intercambiáveis, webhooks com retry e painéis Admin e Merchant.

## Stack

- **Backend:** Node.js (NestJS), TypeORM, PostgreSQL, Redis, BullMQ
- **Frontend:** Next.js 14, Tailwind CSS
- **Infra:** Docker Compose (dev), Nginx + PM2 (produção)

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (para Postgres e Redis)
- npm ou yarn

## Integrar tudo (local → GitHub → deploy)

- **Primeira vez / não sei por onde começar:** **[docs/GUIA-INICIANTE.md](docs/GUIA-INICIANTE.md)** – passo a passo bem detalhado: onde abrir o terminal, em qual pasta rodar cada comando, o que aparece na tela.
- **Já sei usar terminal:** **[docs/SETUP-COMPLETO.md](docs/SETUP-COMPLETO.md)** – todos os comandos em ordem (local → GitHub → Railway + Vercel).

- Você sobe o código no GitHub.
- Eu posso rodar os comandos no Cursor (Git, npm, migrate, seed, start) ou te passar a lista para você rodar.
- Deploy: Railway (API + Worker + Postgres + Redis) + Vercel (frontend); o passo a passo está no mesmo guia.

## Início rápido (desenvolvimento)

### 1. Subir dependências

```bash
docker-compose up -d
```

Isso sobe Postgres (5432), Redis (6379) e MinIO (9000).

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate:run
npm run seed
npm run start:dev
```

API: http://localhost:4000/api  
Swagger: http://localhost:4000/api/docs  
Health: http://localhost:4000/api/health

### 3. Worker (webhooks)

Em outro terminal:

```bash
cd backend
npm run worker:dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Painel: http://localhost:3000

**Credenciais (após seed):**

- Superadmin: `admin@nexgate.local` / `admin123`
- Merchant demo: `demo@nexgate.local` / `demo123`
- API Key: gerada no seed (ver saída do `npm run seed`)

## Scripts principais

| Script        | Descrição                          |
|---------------|------------------------------------|
| `migrate:run` | Build + executa migrações           |
| `seed`       | Cria roles, merchant demo, API key |
| `start:dev`  | API em modo watch                   |
| `worker`     | Worker BullMQ (webhooks)            |
| `start:prod` | API em produção                    |

## API pública (v1)

Base URL: `https://seu-dominio/api/v1`

Autenticação: headers `X-API-Key` e `X-API-Secret`.

- `POST /v1/transactions` – Criar transação (idempotency-key opcional)
- `GET /v1/transactions` – Listar transações
- `GET /v1/transactions/:id` – Obter transação
- `POST /v1/transactions/:id/cancel` – Cancelar
- `POST /v1/transactions/:id/refund` – Estornar
- `GET /v1/webhooks/deliveries` – Listar entregas de webhook
- `POST /v1/webhooks/test` – Enviar evento de teste

Ver Swagger em `/api/docs` para payloads e exemplos.

## Webhooks (para o merchant)

O gateway envia POST para a URL cadastrada com:

- **Headers:** `X-Event-Id`, `X-Timestamp`, `X-Signature` (HMAC-SHA256 de `timestamp.body`)
- **Body:** `{ event, transaction, merchant_id, occurred_at }`

Eventos: `transaction.created`, `transaction.updated`, `transaction.paid`, `transaction.refused`, `transaction.canceled`, `transaction.refunded`, `transaction.chargeback`.

## Deploy

- **Railway (recomendado para começar):** [docs/DEPLOY-RAILWAY.md](docs/DEPLOY-RAILWAY.md) – API, Worker, Postgres e Redis no Railway; frontend na Vercel ou no Railway.
- **VPS / HiUI:** [docs/DEPLOY.md](docs/DEPLOY.md) para:

- Variáveis de ambiente
- Nginx (reverse proxy)
- SSL (Let's Encrypt)
- PM2 (api + worker)
- Backups Postgres

## Estrutura do repositório

```
├── backend/          # NestJS API
│   ├── src/
│   │   ├── modules/  # auth, merchants, users, transactions, connectors, webhooks, api-keys, routing, audit, health
│   │   ├── database/ # data-source, migrations, seed
│   │   └── worker/   # BullMQ worker (webhooks)
│   └── ...
├── frontend/         # Next.js (admin + merchant)
├── docs/             # Documentação e deploy
├── docker-compose.yml
└── README.md
```

## Critérios de aceite (MVP)

- [x] Criar merchant no superadmin
- [x] Merchant cria API key
- [x] Cobrança Pix via API → retorna QR + expiração
- [x] Webhook do provedor (mock) → status paid
- [x] Gateway dispara webhook para URL do merchant com HMAC
- [x] Painel merchant: timeline e logs de webhook
- [x] Superadmin vê visão global
- [x] Trocar conector do merchant (mock A ↔ mock B) sem redeploy
