# O que conferir no Railway e na Vercel

Você conectou o repositório no Railway e na Vercel. **Não consigo ver os dashboards** deles daqui; só o seu código. Use este checklist para conferir e corrigir.

---

## O que já foi verificado (aqui)

- **Backend:** `npm run build` no `backend` → **OK** (compila).
- **Frontend:** `npm run build` no `frontend` → **OK** (compila).
- **Config:** Foi adicionado `backend/railway.json` com `startCommand: npm run start:prod` para o Railway.

---

## Railway – o que conferir

### 1. Quantos serviços você criou?

Você precisa de **4 coisas** no mesmo projeto:

- 1× **PostgreSQL** (Add-on Database)
- 1× **Redis** (Add-on Database)
- 1× **Serviço da API** (deploy do repo)
- 1× **Serviço do Worker** (deploy do mesmo repo)

### 2. Serviço da API (o que sobe o backend)

No serviço que **não** é Postgres nem Redis (o primeiro que veio do GitHub):

- **Settings** → **Root Directory:** deve ser **`backend`**.
- **Settings** → **Build Command:** `npm install && npm run build` (ou deixar em branco para usar o do `package.json`).
- **Settings** → **Start Command:** `npm run start:prod` (ou deixar em branco; o `railway.json` já manda usar isso).
- **Variables:**  
  `NODE_ENV=production`  
  `DATABASE_URL` = (copiar do serviço Postgres)  
  `REDIS_URL` = (copiar do serviço Redis)  
  `JWT_SECRET` = (uma string longa qualquer)  
  `MASTER_KEY_ENCRYPTION` = (ex.: `nexgate-master-key-32-bytes!!`)  
  `WEBHOOK_SIGNING_SECRET` = (ex.: `nexgate-webhook-secret-prod`)  
  `CORS_ORIGINS` = (URL do front na Vercel, ex.: `https://nexgate.vercel.app`)

Se **Root Directory** não for `backend`, o build falha (não acha `package.json`).

### 3. Serviço do Worker

Segundo serviço criado a partir do **mesmo** repositório:

- **Root Directory:** **`backend`**.
- **Build Command:** `npm install && npm run build`.
- **Start Command:** **`npm run worker`** (obrigatório; não é `start:prod`).
- **Variables:** as mesmas da API (ou use “Add from another service” e escolha a API).

### 4. Build falhou no Railway?

Abra o **Deploy** → **View Logs** (Build Logs). O erro mais comum é:

- **“Cannot find module” / “package.json not found”** → **Root Directory** não está como **`backend`**.
- **“Application failed to respond”** → faltou variável (ex.: `DATABASE_URL`, `REDIS_URL`) ou migrações/seed não rodaram no banco de produção.

### 5. Migrações e seed (primeira vez)

No **seu PC**, com a **DATABASE_URL** do Postgres do Railway (Variables do serviço Postgres):

```powershell
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
$env:DATABASE_URL = "postgresql://..."   # colar a URL do Railway
npm run migrate:run
npm run seed
```

Assim as tabelas e os usuários de demo (admin/demo) ficam no banco de produção.

### 6. URL da API

No serviço da **API**, em **Settings** → **Networking** (ou **Generate Domain**), gere o domínio e copie a URL (ex.: `https://nexgate-api.up.railway.app`). Essa é a **URL da API**; o frontend vai usar **essa URL + `/api`**.

---

## Vercel – o que conferir

### 1. Root Directory

No projeto na Vercel: **Settings** → **General** → **Root Directory** deve ser **`frontend`**.

Se estiver em branco ou `.`, o build tenta rodar na raiz do repo e falha (não acha o Next.js).

### 2. Variável de ambiente

**Settings** → **Environment Variables**:

- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://SUA-URL-API-RAILWAY.up.railway.app/api`  
  (troque pela URL real da API no Railway, com **`/api`** no final)

Depois disso, faça **Redeploy** (Deployments → ⋮ → Redeploy).

### 3. Build falhou na Vercel?

Em **Deployments** → clique no deploy que falhou → **Building** (logs). Erros comuns:

- **“No package.json found”** / **“Cannot find module 'next'”** → **Root Directory** não é **`frontend`**.
- Página em branco ou “Failed to fetch” → `NEXT_PUBLIC_API_URL` errada ou CORS (voltar ao Railway e ajustar `CORS_ORIGINS`).

---

## Resumo

| Onde       | O que conferir |
|-----------|------------------|
| **Railway – API**  | Root = `backend`, Start = `npm run start:prod`, variáveis (DATABASE_URL, REDIS_URL, JWT_SECRET, CORS_ORIGINS). |
| **Railway – Worker** | Root = `backend`, Start = **`npm run worker`**, mesmas variáveis. |
| **Railway – Migrações** | Rodar `migrate:run` e `seed` no PC com `DATABASE_URL` do Postgres do Railway. |
| **Vercel** | Root = **`frontend`**, `NEXT_PUBLIC_API_URL` = URL da API + `/api`. |
| **Railway – CORS** | `CORS_ORIGINS` = URL exata do front na Vercel. |

Se você colar aqui a **mensagem de erro** ou o **trecho dos logs** (Railway ou Vercel) que aparecer no build ou ao abrir o site, dá para dizer exatamente o que ajustar.
