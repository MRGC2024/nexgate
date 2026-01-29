# NEXGATE – Deploy no Railway

Guia rápido para hospedar o NEXGATE no [Railway](https://railway.app).

## O que você vai subir

| Serviço   | O que é              | No Railway                    |
|-----------|----------------------|-------------------------------|
| API       | Backend NestJS       | 1 serviço (Node)              |
| Worker    | Fila de webhooks     | 1 serviço (Node)              |
| Frontend  | Next.js (painéis)    | 1 serviço ou Vercel           |
| PostgreSQL| Banco                | Add-on Railway / Neon         |
| Redis     | Fila BullMQ         | Add-on Railway / Upstash      |

## 1. Preparar o repositório

- Suba o código para GitHub/GitLab.
- Confirme que existe `backend/package.json`, `frontend/package.json` e `docker-compose.yml` (só para dev).

## 2. Criar projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login.
2. **New Project** → **Deploy from GitHub repo** e escolha o repositório do NEXGATE.
3. Railway vai detectar o repo; você vai configurar cada serviço manualmente.

## 3. Banco de dados (PostgreSQL)

1. No projeto Railway: **+ New** → **Database** → **PostgreSQL**.
2. Após criar, abra o serviço PostgreSQL e em **Variables** copie a **DATABASE_URL** (ou **POSTGRES_URL**).
3. Anote para usar na API e no Worker.

Se preferir banco externo:

- **[Neon](https://neon.tech)** – PostgreSQL serverless, free tier.
- **[Supabase](https://supabase.com)** – PostgreSQL + extras, free tier.

Use a connection string como `DATABASE_URL` no formato:

`postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`

## 4. Redis

1. No Railway: **+ New** → **Database** → **Redis** (ou use **Plugin** Redis).
2. Copie a variável **REDIS_URL** (ou **REDIS_PRIVATE_URL**).

Alternativa: **[Upstash Redis](https://upstash.com)** (HTTP REST ou Redis URL). Crie um banco e use a URL como `REDIS_URL`.

## 5. Serviço API (Backend)

1. **+ New** → **GitHub Repo** → mesmo repositório (ou **Empty Service** e conecte depois).
2. Configurações do serviço:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod` (ou `node dist/main.js`)
3. **Variables** (Settings → Variables):
   - `NODE_ENV=production`
   - `PORT` – Railway costuma injetar automaticamente; se não, use `4000`.
   - `DATABASE_URL` – do PostgreSQL (Railway ou Neon/Supabase).
   - `REDIS_URL` – do Redis.
   - `JWT_SECRET` – string longa e aleatória (ex.: `openssl rand -hex 32`).
   - `MASTER_KEY_ENCRYPTION` – chave para criptografia de credenciais (ex.: 32 caracteres).
   - `WEBHOOK_SIGNING_SECRET` – segredo para HMAC dos webhooks.
   - `CORS_ORIGINS` – URL do frontend (ex.: `https://seu-app.vercel.app` ou o domínio do front no Railway).
4. **Deploy** → após o build, Railway gera uma URL pública (ex.: `https://xxx.up.railway.app`).
5. **Migrações:** na primeira vez, rode as migrações. Opções:
   - **Railway CLI:** `railway run npm run migrate:run` na pasta `backend`, ou
   - Aba **Settings** do serviço API → **One-off command** (se disponível) com algo como `npm run migrate:run`.
   - Ou localmente com `DATABASE_URL` apontando para o banco de produção: `cd backend && npm run migrate:run`.
6. **Seed** (só uma vez): `railway run npm run seed` (ou local com `DATABASE_URL` de prod).

Use a URL pública da API como **API URL** do frontend (ex.: `https://xxx.up.railway.app`).

## 6. Serviço Worker

1. **+ New** → **GitHub Repo** → mesmo repositório.
2. Configurações:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run worker` (ou `node dist/worker/main.js`)
3. **Variables:** use as **mesmas** do serviço API (`DATABASE_URL`, `REDIS_URL`, etc.), ou compartilhe o mesmo “Environment” no Railway.
4. Deploy. O worker não precisa de domínio público; só precisa acessar Redis e Postgres.

## 7. Frontend (Next.js)

**Opção A – Vercel (recomendado para Next.js)**

1. [vercel.com](https://vercel.com) → Import o repositório.
2. **Root Directory:** `frontend`.
3. **Environment Variable:** `NEXT_PUBLIC_API_URL=https://sua-api.up.railway.app/api` (URL da API no Railway, com `/api` no fim se for o prefixo da API).
4. Deploy. Use a URL gerada (ex.: `https://nexgate.vercel.app`) em `CORS_ORIGINS` da API.

**Opção B – Railway**

1. **+ New** → **GitHub Repo** → mesmo repo.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm run start` (Next.js)
5. Variável: `NEXT_PUBLIC_API_URL=https://sua-api.up.railway.app/api`
6. Em **Settings** do serviço API, adicione a URL do frontend em `CORS_ORIGINS`.

## 8. Domínio e HTTPS

- **Railway:** em cada serviço, **Settings** → **Domains** → **Generate Domain** ou **Custom Domain**. HTTPS é automático.
- **Vercel:** domínio padrão já é HTTPS; pode configurar domínio próprio nas configurações do projeto.

## 9. Checklist rápido

- [ ] PostgreSQL criado e `DATABASE_URL` na API e no Worker.
- [ ] Redis criado e `REDIS_URL` na API e no Worker.
- [ ] Migrações rodadas (`migrate:run`) no banco de produção.
- [ ] Seed rodado uma vez (opcional).
- [ ] API no ar e URL pública definida.
- [ ] Worker no ar (mesmo repo, root `backend`, comando `worker`).
- [ ] Frontend com `NEXT_PUBLIC_API_URL` apontando para a API.
- [ ] `CORS_ORIGINS` na API com a URL do frontend.
- [ ] `JWT_SECRET`, `MASTER_KEY_ENCRYPTION`, `WEBHOOK_SIGNING_SECRET` definidos.

## Custos (ordem de grandeza)

- **Railway:** free tier limitado; depois cobra por uso (CPU, RAM, rede). PostgreSQL e Redis como add-ons contam.
- **Vercel:** free tier generoso para Next.js.
- **Neon / Upstash:** free tiers pequenos, suficientes para MVP.

Para produção séria, compare com um VPS (DigitalOcean, Hetzner, etc.) + deploy manual (veja `docs/DEPLOY.md`).
