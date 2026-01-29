# NEXGATE – Integrar tudo (local → GitHub → deploy)

Este guia reúne **todos os comandos em ordem** para você rodar no terminal (ou eu rodo por você no Cursor). Escolha: **só local** ou **local + GitHub + Railway**.

**Nunca fez isso?** Use primeiro o **[GUIA-INICIANTE.md](GUIA-INICIANTE.md)** – lá está tudo bem detalhado: onde abrir o terminal, em qual pasta rodar cada comando e o que esperar na tela.

---

## Parte 1: Preparar o repositório (uma vez)

### 1.1 Inicializar Git e subir para o GitHub

Rode estes comandos **na raiz do projeto** (pasta `PROJETO GATEWAY`):

```bash
# Entrar na pasta do projeto
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY"

# Inicializar Git (se ainda não tiver)
git init

# Criar .gitignore para não subir node_modules, .env, etc.
# (o arquivo .gitignore já está abaixo)

# Adicionar tudo e primeiro commit
git add .
git commit -m "chore: projeto NEXGATE inicial"
```

**Criar repositório no GitHub:**

1. Acesse [github.com/new](https://github.com/new).
2. Nome do repositório: por exemplo `nexgate`.
3. **Não** marque "Add README" (você já tem código).
4. Clique em **Create repository**.
5. No seu PC, rode (troque `SEU_USUARIO` e `nexgate` pelo seu usuário e nome do repo):

```bash
git remote add origin https://github.com/SEU_USUARIO/nexgate.git
git branch -M main
git push -u origin main
```

Agora o código está no GitHub.

---

## Parte 2: Rodar tudo localmente (desenvolvimento)

Rode na **ordem**. Se algo falhar, pare e avise.

### 2.1 Subir Postgres e Redis (Docker)

```bash
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY"
docker-compose up -d
```

### 2.2 Backend: instalar, migrar, seed e iniciar

```bash
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
copy .env.example .env
npm install
npm run build
npm run migrate:run
npm run seed
npm run start:dev
```

Deixe esse terminal aberto (API rodando). Em **outro terminal**:

### 2.3 Worker (webhooks)

```bash
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
npm run worker:dev
```

Deixe esse terminal aberto também.

### 2.4 Frontend (novo terminal)

```bash
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\frontend"
npm install
npm run dev
```

Acesse: **http://localhost:3000**  
Login: `admin@nexgate.local` / `admin123` ou `demo@nexgate.local` / `demo123`.

---

## Parte 3: Deploy (Railway + Vercel)

Depois que o código estiver no GitHub e funcionando localmente.

### 3.1 Railway – criar projeto

1. Acesse [railway.app](https://railway.app) e faça login (pode ser com GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Autorize o Railway e escolha o repositório `nexgate` (ou o nome que você deu).
4. Railway vai criar um serviço; você vai **adicionar** Postgres, Redis e mais um serviço para o Worker.

### 3.2 Adicionar PostgreSQL e Redis no Railway

1. No projeto Railway: **+ New** → **Database** → **PostgreSQL**. Anote a **DATABASE_URL** (Variables).
2. **+ New** → **Database** → **Redis**. Anote a **REDIS_URL** (ou REDIS_PRIVATE_URL).

### 3.3 Serviço API no Railway

1. **+ New** → **GitHub Repo** → mesmo repositório.
2. No serviço que abrir:
   - **Settings** → **Root Directory:** `backend`
   - **Settings** → **Build Command:** `npm install && npm run build`
   - **Settings** → **Start Command:** `npm run start:prod`
   - **Variables** → adicione (ou use “Add variables from another service” para Postgres/Redis):

```
NODE_ENV=production
DATABASE_URL=<cole a DATABASE_URL do Postgres>
REDIS_URL=<cole a REDIS_URL do Redis>
JWT_SECRET=<gere uma string longa, ex: openssl rand -hex 32>
MASTER_KEY_ENCRYPTION=nexgate-master-key-32-bytes!!
WEBHOOK_SIGNING_SECRET=<outra string longa aleatoria>
CORS_ORIGINS=https://seu-front.vercel.app
```

3. **Deploy** (Deploy Now ou push no GitHub se já tiver conectado).
4. Em **Settings** → **Networking** → **Generate Domain**. Copie a URL (ex: `https://xxx.up.railway.app`). Essa é a **URL da API**.

### 3.4 Rodar migrações no banco do Railway

No seu PC, com Railway CLI **ou** pela interface:

- Se tiver **Railway CLI** instalado (`npm i -g @railway/cli`):

```bash
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
railway link
railway run npm run migrate:run
railway run npm run seed
```

- Se **não** tiver CLI: copie a `DATABASE_URL` do Railway, crie um `.env.production` no `backend` com só essa linha, e rode:

```bash
cd backend
set DATABASE_URL=<cole a URL do Railway>
npm run migrate:run
npm run seed
```

(No PowerShell use `$env:DATABASE_URL="..."` em vez de `set`.)

### 3.5 Serviço Worker no Railway

1. No mesmo projeto Railway: **+ New** → **GitHub Repo** → mesmo repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm run worker`
5. **Variables:** use as mesmas do serviço API (DATABASE_URL, REDIS_URL, etc.) ou o mesmo “environment” do projeto.
6. Deploy. O Worker não precisa de domínio público.

### 3.6 Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub.
2. **Add New** → **Project** → importe o repositório `nexgate`.
3. **Root Directory:** `frontend` (edite e coloque `frontend`).
4. **Environment Variable:**
   - Nome: `NEXT_PUBLIC_API_URL`
   - Valor: `https://SUA-URL-API-RAILWAY.up.railway.app/api` (a URL da API que você gerou no passo 3.3, com `/api` no final).
5. **Deploy**. Copie a URL do projeto (ex: `https://nexgate.vercel.app`).

### 3.7 Ajustar CORS na API (Railway)

1. No Railway, no serviço da **API** → **Variables**.
2. Altere `CORS_ORIGINS` para a URL exata do front na Vercel, ex: `https://nexgate.vercel.app`.
3. Salve (novo deploy será disparado).

---

## Resumo: o que você faz vs o que eu posso fazer

| O que | Quem faz |
|-------|----------|
| Criar repo no GitHub, conectar remote, push | Você (ou eu rodo os comandos Git no Cursor) |
| Rodar `docker-compose`, `npm install`, `migrate`, `seed`, `start:dev`, `worker:dev`, `frontend dev` | Eu posso rodar no terminal do Cursor |
| Criar projeto no Railway, add Postgres/Redis, configurar API e Worker | Você na interface do Railway |
| Configurar variáveis e domínios | Você (copiando do guia) |
| Deploy do front na Vercel e variável NEXT_PUBLIC_API_URL | Você na interface da Vercel |

**Como podemos fazer:** você abre o projeto no Cursor e me diz em que etapa está (ex: “acabei de subir pro GitHub” ou “quero rodar tudo local”). Aí eu **envio os comandos** (ou **rodo aqui** no terminal) na ordem certa para essa etapa. Você só precisa rodar no Railway/Vercel o que for de cliques na interface.

---

## Checklist rápido

- [ ] Git init + .gitignore + commit + push para GitHub
- [ ] Docker: `docker-compose up -d`
- [ ] Backend: install, build, migrate, seed, start:dev
- [ ] Worker: worker:dev (outro terminal)
- [ ] Frontend: install, dev → testar em localhost:3000
- [ ] Railway: projeto + Postgres + Redis + serviço API + serviço Worker
- [ ] Migrations e seed no banco do Railway
- [ ] Vercel: frontend com NEXT_PUBLIC_API_URL
- [ ] CORS_ORIGINS na API = URL do front Vercel

Quando quiser, diga: “quero integrar tudo” ou “estou na parte X” que eu te passo os próximos comandos (ou rodo os que forem no Cursor).
