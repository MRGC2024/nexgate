# NEXGATE – Deploy detalhado (passo a passo)

Você já **importou o repositório** no Railway e na Vercel. Este guia diz **exatamente** o que fazer em seguida, em ordem. Siga do início ao fim.

---

# PARTE 1 – RAILWAY

O Railway vai hospedar: **banco de dados (Postgres)**, **Redis**, **API (backend)** e **Worker**. Você vai criar cada um dentro do **mesmo projeto**.

---

## Passo 1.1 – Abrir o projeto no Railway

1. Acesse **https://railway.app** e faça login.
2. Na lista de projetos, clique no projeto que você criou ao importar o repositório (provavelmente se chama **nexgate** ou o nome do repo).
3. Você deve ver uma tela com o projeto. Pode aparecer **um serviço** (o que veio do GitHub). Anote: esse serviço será a **API**. Mais à frente vamos criar o **Worker** e adicionar **Postgres** e **Redis**.

---

## Passo 1.2 – Adicionar o banco PostgreSQL

1. Dentro do projeto, clique no botão **"+ New"** (ou **"Add a service"** / **"New"**).
2. Escolha **"Database"** (ou **"Plugin"**).
3. Na lista, clique em **"PostgreSQL"**.
4. Espere alguns segundos. O Railway vai criar o Postgres.
5. Quando aparecer o novo bloco **"PostgreSQL"**, clique nele.
6. Vá na aba **"Variables"** (ou **"Connect"**).
7. Você verá variáveis como **`DATABASE_URL`** ou **`POSTGRES_URL`** ou **`PGURL`**. **Copie o valor** dessa URL (é uma linha longa que começa com `postgresql://`). **Guarde em um bloco de notas** – você vai usar na API e no Worker.
8. Se não aparecer uma URL pronta, procure **Host**, **Port**, **User**, **Password**, **Database** e monte a URL assim:  
   `postgresql://USUARIO:SENHA@HOST:PORT/railway?sslmode=require`  
   (troque USUARIO, SENHA, HOST, PORT pelos valores que aparecem).

**Pronto:** o Postgres está criado. Volte para a tela do projeto (clique no nome do projeto no topo ou em "Back").

---

## Passo 1.3 – Adicionar o Redis

1. De novo, clique em **"+ New"** (no mesmo projeto).
2. Escolha **"Database"** (ou **"Plugin"**).
3. Clique em **"Redis"**.
4. Espere criar. Clique no bloco **"Redis"** que aparecer.
5. Na aba **"Variables"**, copie o valor de **`REDIS_URL`** ou **`REDIS_PRIVATE_URL`**. **Guarde** no bloco de notas.
6. Volte para a tela do projeto.

**Pronto:** Redis criado.

---

## Passo 1.4 – Configurar o serviço da API (o que veio do GitHub)

1. No projeto, clique no **serviço que NÃO é Postgres e NÃO é Redis** (o que veio quando você importou o repo). Pode se chamar **nexgate** ou **web** ou algo assim.
2. Abra **"Settings"** (engrenagem ou aba **Settings**).
3. Procure **"Root Directory"** ou **"Source"**:
   - Se tiver campo **Root Directory**, digite: **`backend`**
   - Se tiver **Monorepo** / **Root**, escolha ou digite **`backend`**
   - Salve (Save / Apply).
4. Procure **"Build Command"** (comando de build):
   - Digite: **`npm install && npm run build`**
   - Ou deixe em branco se o Railway já preencher com algo parecido.
5. Procure **"Start Command"** ou **"Start"** (comando para iniciar):
   - Digite: **`npm run start:prod`**
   - Salve.
6. Agora vá na aba **"Variables"** (variáveis de ambiente).
7. Clique em **"Add Variable"** ou **"New Variable"** e adicione **uma por uma** (nome = valor):

   | Nome | Valor (troque pelo que você tem) |
   |------|----------------------------------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(cole a URL do Postgres que você guardou no passo 1.2)* |
   | `REDIS_URL` | *(cole a URL do Redis que você guardou no passo 1.3)* |
   | `JWT_SECRET` | `minha-chave-secreta-jwt-mude-em-producao-32-chars` |
   | `MASTER_KEY_ENCRYPTION` | `nexgate-master-key-32-bytes!!` |
   | `WEBHOOK_SIGNING_SECRET` | `nexgate-webhook-secret-prod` |
   | `CORS_ORIGINS` | *(deixe em branco por agora; preenche depois com a URL do front)* |

8. Salve as variáveis.
9. Procure **"Networking"** ou **"Generate Domain"** ou **"Public Networking"**:
   - Clique em **"Generate Domain"** (ou **"Add domain"**).
   - O Railway vai gerar uma URL, por exemplo: **`https://nexgate-api-production-xxxx.up.railway.app`**.
   - **Copie essa URL inteira** e guarde no bloco de notas como **URL da API**. Você vai usar na Vercel e no CORS.

10. O Railway deve fazer um **novo deploy** sozinho. Espere terminar (pode levar 1–2 minutos). Se der erro, anote a mensagem e veja a seção "Erros comuns" no final.

**Pronto:** a API está configurada e com domínio. A URL da API é essa que você copiou (sem `/api` no final – o frontend que vai usar com `/api`).

---

## Passo 1.5 – Criar o serviço do Worker

1. No **mesmo projeto** Railway, clique de novo em **"+ New"**.
2. Escolha **"GitHub Repo"** (ou **"Deploy from GitHub"**).
3. Selecione o **mesmo repositório** (nexgate).
4. Um novo serviço vai aparecer. Clique nele.
5. Em **Settings**:
   - **Root Directory:** **`backend`**
   - **Build Command:** **`npm install && npm run build`**
   - **Start Command:** **`npm run worker`**  ← **Importante:** tem que ser **worker**, não start:prod.
   - Salve.
6. Em **Variables**, adicione as **mesmas variáveis** da API (NODE_ENV, DATABASE_URL, REDIS_URL, JWT_SECRET, MASTER_KEY_ENCRYPTION, WEBHOOK_SIGNING_SECRET).  
   No Railway às vezes dá para clicar em **"Add from another service"** e escolher o serviço da API para copiar as variáveis. Senão, copie e cole uma a uma.
7. **Não** precisa gerar domínio para o Worker – ele não recebe acesso pela internet.
8. Espere o deploy do Worker terminar.

**Pronto:** Worker configurado.

---

## Passo 1.6 – Rodar migrações e seed no banco (no seu PC)

O banco no Railway está vazio. Precisamos criar as tabelas e os usuários de demo (admin/demo). Isso você faz **uma vez**, no seu computador, usando a **DATABASE_URL** do Railway.

1. Abra o **PowerShell** ou o **terminal do Cursor**.
2. Vá na pasta do backend:
   ```powershell
   cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
   ```
3. Cole a **DATABASE_URL** do Railway (a que você guardou no passo 1.2). No PowerShell, use (troque pela sua URL real):
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:SENHA@HOST.railway.app:PORT/railway?sslmode=require"
   ```
   Use a URL **inteira** que o Railway mostrou no Postgres (Variables).
4. Rode as migrações (criar tabelas):
   ```powershell
   npm run migrate:run
   ```
   Deve aparecer algo como "Migration ... has been executed successfully".
5. Rode o seed (criar usuários admin e demo):
   ```powershell
   npm run seed
   ```
   Deve aparecer "Seed concluído." e as credenciais (admin@nexgate.local / admin123 e demo@nexgate.local / demo123).

**Pronto:** banco de produção com tabelas e usuários. O login no painel vai funcionar depois que você configurar o front na Vercel.

---

# PARTE 2 – VERCEL (FRONTEND)

O frontend (painel) fica na Vercel. Você já importou o repositório; agora é configurar **pasta raiz** e **variável da API**.

---

## Passo 2.1 – Abrir o projeto na Vercel

1. Acesse **https://vercel.com** e faça login.
2. Na **Dashboard**, clique no projeto que você criou ao importar o repositório (ex.: **nexgate**).

---

## Passo 2.2 – Definir Framework e pasta raiz (Root Directory)

1. No projeto, clique em **"Settings"** (no topo).
2. No menu da esquerda, clique em **"General"**.
3. **Framework Preset:** tem que ser **Next.js**. Se estiver **"Other"** (ou outro), clique em **Edit** e escolha **Next.js** → **Save**. Sem isso a Vercel não serve o app e pode dar 404.
4. No campo **"Root Directory"**, clique em **"Edit"**.
5. Digite: **`frontend`**
6. Clique em **"Save"**.

**Pronto:** a Vercel vai detectar Next.js e buildar só a pasta `frontend`.

---

## Passo 2.3 – Adicionar a URL da API (variável de ambiente)

1. Ainda em **Settings**, no menu da esquerda clique em **"Environment Variables"**.
2. Em **"Key"** (nome), digite: **`NEXT_PUBLIC_API_URL`**
3. Em **"Value"** (valor), digite a **URL da API** que você guardou no passo 1.4, **mais** `/api` no final.  
   Exemplo: se a URL da API for `https://nexgate-api-production-xxxx.up.railway.app`, o valor deve ser:  
   **`https://nexgate-api-production-xxxx.up.railway.app/api`**
4. Deixe **Production**, **Preview** e **Development** marcados (ou só **Production**).
5. Clique em **"Save"**.

**Pronto:** o frontend vai saber qual API usar em produção.

---

## Passo 2.4 – Output Directory e Framework (importante para Next.js)

- **Framework Preset** (em General) tem que ser **Next.js**. Se estiver "Other", mude para **Next.js** e salve; senão o site pode dar **404** mesmo com build OK.
- **Output Directory:** com Framework = Next.js, deixe o **Override** em **OFF**. Não use "public"; a Vercel usa o build do Next.js sozinha. Se tiver dado erro "No Output Directory named 'public'", ligue **Override** em ON, deixe o campo vazio, salve; depois de mudar Framework para Next.js, pode deixar Override em OFF de novo.

---

## Passo 2.5 – Fazer o deploy (ou redeploy)

1. Volte em **"Deployments"** (no topo).
2. Se aparecer um deploy em andamento, espere terminar.
3. Se não tiver deploy recente depois de mudar Root e variável, clique em **"Redeploy"** no último deploy (três pontinhos → Redeploy) e confirme.
4. Espere o build terminar (alguns minutos).
5. Quando estiver **Ready**, clique no **domínio** (ex.: `nexgate.vercel.app`) para abrir o site.

**Pronto:** frontend no ar.

---

## Passo 2.6 – Ajustar o CORS no Railway (para o front acessar a API)

1. Volte no **Railway** → projeto → serviço da **API** (não o Worker).
2. Vá em **Variables**.
3. Edite a variável **`CORS_ORIGINS`** e coloque **exatamente** a URL do frontend na Vercel (sem barra no final).  
   Exemplo: **`https://nexgate.vercel.app`** (troque pelo domínio que a Vercel mostrou).
4. Salve. O Railway faz um novo deploy da API sozinho.

**Pronto:** o navegador vai permitir o front (Vercel) chamar a API (Railway).

---

# PARTE 3 – TESTAR

1. Abra no navegador a **URL do frontend** (a que a Vercel mostrou, ex.: `https://nexgate.vercel.app`).
2. Deve aparecer a tela de **login** do NEXGATE.
3. Faça login com:
   - **admin@nexgate.local** / **admin123**  
   ou  
   - **demo@nexgate.local** / **demo123**
4. Se entrar no painel, o deploy está certo.

---

# ERROS COMUNS

**Railway – build falhou / "Cannot find module" / "package.json not found"**  
→ O serviço da API (e o Worker) precisam ter **Root Directory = `backend`**. Confira em Settings.

**Railway – "Application failed to respond"**  
→ A API não sobe. Confira **Variables** do serviço da API: **DATABASE_URL** (copie do Postgres) e **REDIS_URL** (copie do Redis). O backend usa **DATABASE_URL** quando existir (formato Railway). Veja os **Logs** do deploy para a mensagem exata. Rode o passo 1.6 (migrações e seed no PC) com a mesma DATABASE_URL.

**Vercel – build falhou / "No package.json"**  
→ **Root Directory** tem que ser **`frontend`**. Confira em Settings → General.

**Vercel – "No Output Directory named 'public' found"**  
→ Em **Settings** → **General** → **Build & Development Settings**, o campo **Output Directory** deve estar **vazio** (não use "public"). Next.js não usa esse campo; a Vercel usa o build automático. Apague o valor, salve e faça **Redeploy**.

**Vercel – "No entrypoint found. Searched for: src/main.js, index.js, ..."**  
→ O projeto está como **"Other"** em vez de **Next.js**. Em **Settings** → **General** → **Framework Preset**, mude para **Next.js** e salve. Em **Build & Development Settings**, deixe **Build Command** com Override **OFF**. Faça **Redeploy**. Sem Framework = Next.js, a Vercel trata o build como app Node genérico e procura main/index.js.

**Frontend abre mas login não funciona / "Failed to fetch"**  
→ Confira: **NEXT_PUBLIC_API_URL** na Vercel está com a URL da API + **`/api`**? E **CORS_ORIGINS** no Railway está com a URL exata do front (ex.: `https://nexgate.vercel.app`)?

**Login diz "Email ou senha inválidos"**  
→ As migrações e o seed (passo 1.6) foram rodados no **mesmo** banco cuja **DATABASE_URL** está na API do Railway? Se sim, tente admin@nexgate.local / admin123 (sem espaços).

---

# RESUMO DA ORDEM

1. **Railway:** criar Postgres → criar Redis → configurar serviço da API (root `backend`, variáveis, domínio) → criar serviço Worker (root `backend`, start `npm run worker`) → rodar migrações e seed no PC com DATABASE_URL do Railway.
2. **Vercel:** Root Directory = `frontend` → variável NEXT_PUBLIC_API_URL = URL da API + `/api` → Redeploy.
3. **Railway de novo:** CORS_ORIGINS = URL do front na Vercel.
4. **Testar:** abrir o site na Vercel e fazer login com admin/demo.

Se em algum passo aparecer uma mensagem de erro diferente das acima, copie a mensagem e o passo em que parou que dá para ajustar o próximo movimento.
