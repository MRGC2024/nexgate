# NEXGATE – Deploy para produção (passo a passo)

O código já está no **GitHub** (repositório que você conectou). Agora vamos subir para produção em dois lugares:

- **Railway** – API, Worker, PostgreSQL e Redis  
- **Vercel** – Frontend (painéis)

Siga a ordem abaixo. O que for “no site” você faz no navegador; o que for comando você roda no terminal.

---

## Parte 1 – Railway (API + Worker + Postgres + Redis)

### 1.1 Criar projeto no Railway

1. Acesse **https://railway.app** e faça login (pode ser com GitHub).
2. Clique em **New Project**.
3. Escolha **Deploy from GitHub repo**.
4. Autorize o Railway no GitHub (se pedir) e selecione o repositório **nexgate** (ou o nome que você deu).
5. O Railway vai criar um projeto. Você vai adicionar os serviços abaixo.

### 1.2 Adicionar PostgreSQL

1. No projeto: **+ New** → **Database** → **PostgreSQL**.
2. Espere criar. Depois clique no serviço **PostgreSQL**.
3. Aba **Variables**: copie o valor de **DATABASE_URL** (ou **POSTGRES_URL**) e guarde – você vai colar na API e no Worker.

### 1.3 Adicionar Redis

1. No projeto: **+ New** → **Database** → **Redis**.
2. Espere criar. Clique no serviço **Redis**.
3. Aba **Variables**: copie **REDIS_URL** (ou **REDIS_PRIVATE_URL**) e guarde.

### 1.4 Criar serviço da API (Backend)

1. **+ New** → **GitHub Repo** → selecione o **mesmo repositório** (nexgate).
2. Clique no serviço que apareceu (o que não é Postgres nem Redis).
3. **Settings** (ou **Config**):
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
4. **Variables** (ou **Variables** no menu): adicione (troque os valores pelos seus):

   | Nome | Valor |
   |------|--------|
   | NODE_ENV | production |
   | DATABASE_URL | *(cole a DATABASE_URL do Postgres)* |
   | REDIS_URL | *(cole a REDIS_URL do Redis)* |
   | JWT_SECRET | *(gere uma string longa, ex.: 32 caracteres aleatórios)* |
   | MASTER_KEY_ENCRYPTION | *(ex.: nexgate-master-key-32-bytes!!)* |
   | WEBHOOK_SIGNING_SECRET | *(ex.: nexgate-webhook-secret-prod)* |
   | CORS_ORIGINS | *(deixe em branco por agora; preenche depois com a URL do front)* |

5. **Deploy**: o Railway vai fazer o build e subir. Espere terminar.
6. **Domínio**: em **Settings** → **Networking** (ou **Generate Domain**) → **Generate Domain**. Copie a URL (ex.: `https://nexgate-api.up.railway.app`). Essa é a **URL da API**.

### 1.5 Rodar migrações e seed no banco (primeira vez)

No **seu PC**, na pasta do projeto, com a **DATABASE_URL de produção** (a que você copiou do Railway):

1. Crie um arquivo temporário no `backend` com só a variável de produção, por exemplo:
   - No PowerShell (troque pela sua URL real):
   ```powershell
   cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
   $env:DATABASE_URL = "postgresql://postgres:SENHA@HOST:PORT/railway?sslmode=require"
   npm run migrate:run
   npm run seed
   ```
   Use a **DATABASE_URL** que o Railway mostrou no serviço PostgreSQL (Variables).

2. Ou use o **Railway CLI** (se instalar: `npm i -g @railway/cli`):
   ```powershell
   cd backend
   railway link
   railway run npm run migrate:run
   railway run npm run seed
   ```

### 1.6 Criar serviço do Worker

1. No **mesmo projeto** Railway: **+ New** → **GitHub Repo** → mesmo repositório.
2. Clique no novo serviço:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run worker`
3. **Variables:** use as **mesmas** da API (DATABASE_URL, REDIS_URL, JWT_SECRET, etc.). No Railway você pode usar **Variables** → **Add from another service** ou colar as mesmas variáveis.
4. **Deploy** – o Worker não precisa de domínio público.

---

## Parte 2 – Vercel (Frontend)

### 2.1 Criar projeto no Vercel

1. Acesse **https://vercel.com** e faça login (pode ser com GitHub).
2. **Add New** → **Project**.
3. Importe o repositório **nexgate** (ou o nome que você deu).
4. **Configure Project**:
   - **Root Directory:** clique em **Edit** e coloque `frontend`.
   - **Environment Variable:** adicione:
     - **Name:** `NEXT_PUBLIC_API_URL`
     - **Value:** `https://SUA-URL-API-RAILWAY.up.railway.app/api`  
       (troque pela URL da API que você gerou no passo 1.4, com `/api` no final)
5. **Deploy** – espere o build terminar.
6. Copie a URL do projeto (ex.: `https://nexgate.vercel.app`). Essa é a **URL do frontend**.

### 2.2 Ajustar CORS na API (Railway)

1. Volte no **Railway** → serviço da **API** → **Variables**.
2. Edite **CORS_ORIGINS** e coloque **exatamente** a URL do frontend (ex.: `https://nexgate.vercel.app`).
3. Salve – o Railway faz redeploy automático.

---

## Checklist rápido

- [ ] Código no GitHub (já feito)
- [ ] Railway: projeto criado, Postgres e Redis adicionados
- [ ] Railway: serviço API (root `backend`, build, start `npm run start:prod`, variáveis)
- [ ] Migrações e seed rodados no banco de produção (DATABASE_URL do Railway)
- [ ] Railway: serviço Worker (root `backend`, start `npm run worker`, mesmas variáveis)
- [ ] Vercel: projeto criado (root `frontend`), variável `NEXT_PUBLIC_API_URL` = URL da API + `/api`
- [ ] CORS_ORIGINS na API = URL do frontend na Vercel

---

## Onde está o quê

| O quê | Onde |
|-------|------|
| Código | GitHub (repositório que você conectou) |
| API + Worker + Postgres + Redis | Railway |
| Frontend (painéis) | Vercel |
| Login em produção | Use as mesmas credenciais: admin@nexgate.local / admin123 e demo@nexgate.local / demo123 (após rodar o seed no banco de produção) |

Quando terminar a Parte 1 e a Parte 2, o NEXGATE estará em produção: você acessa a URL do Vercel, faz login e usa o painel normalmente.
