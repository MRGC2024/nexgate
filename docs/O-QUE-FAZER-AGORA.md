# O que fazer AGORA (você já importou no Railway e na Vercel)

Você **só** importou o repositório no Railway e na Vercel. Isso criou **um serviço em cada um**. Ainda falta **configurar** cada parte. Siga esta ordem.

Para cada passo com mais detalhes (cada clique, cada campo), use o **[DEPLOY-DETALHADO.md](DEPLOY-DETALHADO.md)**.

---

## Resumo em 1 minuto

| Onde | O que fazer |
|------|-------------|
| **Railway** | Criar Postgres + Redis, configurar o serviço da API (pasta `backend`, variáveis, domínio), criar o Worker, rodar migrações/seed no PC |
| **Vercel** | Colocar Root Directory = `frontend`, variável `NEXT_PUBLIC_API_URL` = URL da API + `/api`, redeploy |
| **Railway de novo** | Colocar `CORS_ORIGINS` = URL do front na Vercel |

---

# RAILWAY – o que fazer (na ordem)

### 1. Adicionar PostgreSQL
- No projeto Railway: **+ New** → **Database** → **PostgreSQL**.
- Quando criar, entre no serviço Postgres → **Variables** → copie o valor de **DATABASE_URL** e guarde (bloco de notas).

### 2. Adicionar Redis
- **+ New** → **Database** → **Redis**.
- Entre no Redis → **Variables** → copie **REDIS_URL** (ou REDIS_PRIVATE_URL) e guarde.

### 3. Configurar o serviço da API (o que veio do GitHub)
- Clique no serviço que **não** é Postgres nem Redis (o do repo).
- **Settings:**
  - **Root Directory:** `backend`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm run start:prod`
- **Variables** – adicione (uma por uma):

  | Nome | Valor |
  |------|--------|
  | `NODE_ENV` | `production` |
  | `DATABASE_URL` | *(a URL que você copiou do Postgres)* |
  | `REDIS_URL` | *(a URL que você copiou do Redis)* |
  | `JWT_SECRET` | `minha-chave-secreta-jwt-mude-em-producao-32-chars` |
  | `MASTER_KEY_ENCRYPTION` | `nexgate-master-key-32-bytes!!` |
  | `WEBHOOK_SIGNING_SECRET` | `nexgate-webhook-secret-prod` |
  | `CORS_ORIGINS` | *(deixe em branco por agora; preenche depois)* |

- **Networking:** **Generate Domain** → copie a URL (ex: `https://xxx.up.railway.app`) e guarde como **URL da API**.

### 4. Criar o serviço do Worker
- **+ New** → **GitHub Repo** → mesmo repositório.
- No novo serviço:
  - **Settings:** Root = `backend`, Build = `npm install && npm run build`, **Start = `npm run worker`** (obrigatório).
  - **Variables:** mesmas da API (ou “Add from another service” → API).

### 5. Rodar migrações e seed no seu PC (uma vez)
No **PowerShell** ou terminal do Cursor:

```powershell
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
$env:DATABASE_URL = "postgresql://..."   # cole a DATABASE_URL do Postgres do Railway
npm run migrate:run
npm run seed
```

Isso cria as tabelas e os usuários (admin/demo) no banco de produção.

---

# VERCEL – o que fazer (na ordem)

### 1. Root Directory
- **Settings** → **General** → **Root Directory** → **Edit** → digite: **`frontend`** → **Save**.

### 2. Variável da API
- **Settings** → **Environment Variables**:
  - **Key:** `NEXT_PUBLIC_API_URL`
  - **Value:** `https://SUA-URL-API-RAILWAY.up.railway.app/api`  
    (troque pela **URL da API** que você guardou no passo 3 do Railway, **com `/api` no final**).
- **Save**.

### 3. Deploy
- **Deployments** → no último deploy, **⋮** → **Redeploy** (para pegar Root + variável).
- Quando terminar, copie a URL do site (ex: `https://nexgate.vercel.app`) e guarde.

---

# RAILWAY – último ajuste (CORS)

- No Railway, no serviço da **API** → **Variables**.
- Edite **`CORS_ORIGINS`** e coloque **exatamente** a URL do front na Vercel (ex: `https://nexgate.vercel.app`).
- Salve (vai dar redeploy da API).

---

# Testar

1. Abra a **URL do frontend** (Vercel) no navegador.
2. Deve aparecer a tela de **login** do NEXGATE.
3. Login: **admin@nexgate.local** / **admin123** (ou **demo@nexgate.local** / **demo123**).
4. Se entrar no painel, está tudo certo.

---

# Se algo der errado

- **Railway – build falhou / "package.json not found"**  
  → Root Directory do serviço da API (e do Worker) tem que ser **`backend`**.

- **Vercel – build falhou / "Cannot find module 'next'"**  
  → Root Directory tem que ser **`frontend`**.

- **Site abre mas login não funciona / "Failed to fetch"**  
  → Confira: `NEXT_PUBLIC_API_URL` na Vercel = URL da API **+ `/api`**? E `CORS_ORIGINS` no Railway = URL exata do front (ex: `https://nexgate.vercel.app`)?

- **"Email ou senha inválidos"**  
  → Você rodou `migrate:run` e `seed` no PC com a **mesma** DATABASE_URL que está na API do Railway?

Guia completo (cada clique): **[DEPLOY-DETALHADO.md](DEPLOY-DETALHADO.md)**.  
Checklist para conferir depois: **[CONFERIR-DEPLOY.md](CONFERIR-DEPLOY.md)**.
