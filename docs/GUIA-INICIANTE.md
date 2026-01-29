# NEXGATE – Guia para quem nunca fez isso

Este guia explica **cada passo** do zero: onde clicar, onde digitar, o que aparece na tela. Siga na ordem.

---

## O que você vai usar

1. **Pasta do projeto** – é a pasta no seu PC onde está o NEXGATE. No seu caso:
   ```
   c:\Users\drrod\Downloads\PROJETO GATEWAY
   ```
   Dentro dela existem as pastas `backend`, `frontend`, `docs`, etc.

2. **Terminal** – é uma janela onde você digita comandos (texto) em vez de clicar com o mouse. Tudo que vamos fazer é nessa janela.

3. **Cursor** – é o programa onde você está agora (editor de código). Ele tem um terminal embutido. É nele que vamos trabalhar.

---

## Onde abrir o terminal

### Opção A: Dentro do Cursor (recomendado)

1. Abra o Cursor.
2. Abra a pasta do projeto: **File** → **Open Folder** (ou **Arquivo** → **Abrir Pasta**).
3. Escolha a pasta: `C:\Users\drrod\Downloads\PROJETO GATEWAY` e clique em **Selecionar Pasta**.
4. Abra o terminal: no menu superior, **Terminal** → **New Terminal** (ou atalho **Ctrl + '**).
5. Aparece uma janela embaixo com uma linha onde dá para digitar. Essa janela é o **terminal**. Tudo que for “rode no terminal” é aí.

### Opção B: Terminal do Windows (fora do Cursor)

1. Aperte **Windows + R** (abre “Executar”).
2. Digite `powershell` e dê Enter.
3. Abre uma janela azul/preta. Essa é o terminal.
4. Para entrar na pasta do projeto, digite exatamente isto e dê Enter:
   ```powershell
   cd "c:\Users\drrod\Downloads\PROJETO GATEWAY"
   ```
   Depois disso, todos os comandos abaixo são digitados nessa mesma janela (ou em novas abas/janelas quando o guia disser “abra outro terminal”).

---

## Regras importantes

- **Onde rodar:**  
  - Alguns comandos rodam **na raiz do projeto** (pasta `PROJETO GATEWAY`).  
  - Outros rodam **dentro de `backend`** ou **dentro de `frontend`**.  
  O guia diz sempre: “Na raiz do projeto” ou “Dentro da pasta backend”, etc.

- **O que digitar:**  
  Copie e cole o comando (uma linha por vez) e dê **Enter**. Não precisa entender o que significa; só seguir.

- **Se der erro:**  
  Anote a mensagem que aparecer (ou envie um print) e pare nesse passo. Não pule para o próximo.

---

# PARTE 1 – Deixar o projeto no GitHub

Assim você tem uma cópia na nuvem e pode usar para deploy depois.

---

## Passo 1.1 – Abrir o terminal na pasta do projeto

1. No Cursor: **Terminal** → **New Terminal**.
2. Verifique se no início da linha aparece algo como:
   ```text
   PS C:\Users\drrod\Downloads\PROJETO GATEWAY>
   ```
   Se aparecer outra pasta (por exemplo `C:\Users\drrod>`), digite e dê Enter:
   ```powershell
   cd "c:\Users\drrod\Downloads\PROJETO GATEWAY"
   ```
3. Pronto. Daqui pra frente, quando o guia disser “na raiz do projeto”, seu terminal já está nessa pasta.

---

## Passo 1.2 – Inicializar o Git (controle de versão)

1. **Onde:** na raiz do projeto (terminal já aberto como no 1.1).
2. **O que digitar:** (copie tudo de uma vez)
   ```powershell
   git init
   ```
3. **Enter.**
4. **O que deve aparecer:** algo como `Initialized empty Git repository in C:/Users/drrod/Downloads/PROJETO GATEWAY/.git/`.  
   Se aparecer “comando não encontrado” ou “git is not recognized”, o Git não está instalado; aí precisa instalar o Git for Windows primeiro e tentar de novo.

---

## Passo 1.3 – Adicionar os arquivos e fazer o primeiro commit

1. **Onde:** mesmo terminal, mesma pasta (raiz do projeto).
2. **Primeiro comando:**
   ```powershell
   git add .
   ```
   **Enter.**  
   (Não precisa aparecer nada; às vezes não aparece mensagem.)

3. **Segundo comando:**
   ```powershell
   git commit -m "chore: projeto NEXGATE inicial"
   ```
   **Enter.**

4. **O que deve aparecer:** algo como “X files changed”, “create mode 100644 …”.  
   Se pedir “Please tell me who you are”, digite (trocando pelo seu nome e email):
   ```powershell
   git config --global user.email "seu@email.com"
   git config --global user.name "Seu Nome"
   ```
   Depois repita o `git add .` e o `git commit -m "chore: projeto NEXGATE inicial"`.

---

## Passo 1.4 – Criar o repositório no site do GitHub

1. Abra o navegador e vá em: **https://github.com**
2. Faça login (ou crie uma conta).
3. Clique no **+** no canto superior direito → **New repository**.
4. Em **Repository name** digite, por exemplo: `nexgate`.
5. Deixe **Public**.
6. **Não** marque “Add a README file”.
7. Clique em **Create repository**.
8. Na página que abrir, você verá uma URL, algo como:
   ```text
   https://github.com/SEU_USUARIO/nexgate.git
   ```
   Anote ou deixe a página aberta. Você vai precisar dessa URL no próximo passo.

---

## Passo 1.5 – Ligar sua pasta ao GitHub e enviar o código

1. **Onde:** mesmo terminal, na raiz do projeto.
2. **O que digitar:** (troque `SEU_USUARIO` pelo seu usuário do GitHub e `nexgate` pelo nome do repositório se tiver usado outro)
   ```powershell
   git remote add origin https://github.com/SEU_USUARIO/nexgate.git
   ```
   **Enter.**

3. Depois:
   ```powershell
   git branch -M main
   ```
   **Enter.**

4. Depois:
   ```powershell
   git push -u origin main
   ```
   **Enter.**

5. Pode pedir **login do GitHub** (usuário e senha, ou token). Se pedir, use sua conta.  
   Quando terminar, no site do GitHub, ao abrir o repositório, você deve ver todos os arquivos do projeto.  
   **Fim da Parte 1.** O código já está no GitHub.

---

# PARTE 2 – Rodar tudo na sua máquina (desenvolvimento)

Agora vamos subir o banco de dados, a API, o worker e o frontend no seu PC.

---

## Passo 2.1 – Subir Postgres, Redis e MinIO com Docker

1. **Onde:** terminal na **raiz do projeto** (`PROJETO GATEWAY`).
2. Se não estiver nessa pasta, digite:
   ```powershell
   cd "c:\Users\drrod\Downloads\PROJETO GATEWAY"
   ```
3. **Antes de rodar:** o **Docker Desktop** precisa estar **aberto e rodando** (ícone na bandeja do Windows sem animação de “iniciando”). Se não estiver, abra pelo Menu Iniciar e espere até ficar pronto.
4. Digite **um** dos comandos abaixo (depende da sua versão do Docker):
   ```powershell
   docker compose up -d
   ```
   ou, se der erro “comando não reconhecido”:
   ```powershell
   docker-compose up -d
   ```
   **Enter.**

5. **O que deve acontecer:** o Docker baixa as imagens (Postgres, Redis, MinIO) e sobe os containers. No final pode aparecer algo como “Creating nexgate-postgres … done”, “Creating nexgate-redis … done”, “Creating nexgate-minio … done”.

**Se aparecer erro:**

- **“docker-compose” ou “docker” não é reconhecido:** o Docker Desktop não está instalado ou não está no PATH. Instale o [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/) e reinicie o terminal.
- **“Docker Desktop is unable to start” ou “unable to get image … Docker Desktop is unable to start”:** o Docker não está conseguindo iniciar. **Siga o guia [docs/CORRIGIR-DOCKER-DESKTOP.md](CORRIGIR-DOCKER-DESKTOP.md)** – lá está o passo a passo para habilitar WSL 2, virtualização na BIOS e fazer o Docker subir. Depois que o Docker estiver rodando, volte aqui e rode de novo o comando do item 4.

---

## Passo 2.2 – Entrar na pasta do backend

1. **Onde:** mesmo terminal (ou um novo, mas sempre na raiz primeiro).
2. Digite:
   ```powershell
   cd backend
   ```
   **Enter.**  
   O “prompt” deve mudar para algo como:
   ```text
   PS C:\Users\drrod\Downloads\PROJETO GATEWAY\backend>
   ```
   Daqui pra frente, quando o guia disser “dentro da pasta backend”, é essa pasta.

---

## Passo 2.3 – Copiar o arquivo de ambiente

1. **Onde:** terminal **dentro da pasta backend** (como no 2.2).
2. Digite:
   ```powershell
   copy .env.example .env
   ```
   **Enter.**  
   (No PowerShell pode ser `Copy-Item .env.example .env` se `copy` não funcionar.)  
   Isso cria o arquivo `.env` com configurações padrão. Não precisa abrir o arquivo.

---

## Passo 2.4 – Instalar dependências do backend

1. **Onde:** terminal **dentro da pasta backend**.
2. Digite:
   ```powershell
   npm install
   ```
   **Enter.**

3. **O que deve acontecer:** o npm baixa pacotes. Pode demorar 1–2 minutos. No final não deve aparecer erro em vermelho.  
   Se aparecer “npm not found”, o Node.js não está instalado; instale e tente de novo.

---

## Passo 2.5 – Compilar e rodar as migrações do banco

1. **Onde:** terminal **dentro da pasta backend**.
2. Primeiro, compilar:
   ```powershell
   npm run build
   ```
   **Enter.**  
   Deve terminar sem erro (pode aparecer “Successfully compiled” ou só voltar o prompt).

3. Depois, criar as tabelas no banco:
   ```powershell
   npm run migrate:run
   ```
   **Enter.**  
   Deve aparecer algo como “Migration InitialSchema... has been executed successfully.”

4. Depois, popular o banco (usuários, merchant demo, etc.):
   ```powershell
   npm run seed
   ```
   **Enter.**  
   Deve aparecer “Seed concluído.” e as credenciais (admin@nexgate.local, demo@nexgate.local, API key).  
   Pode anotar a **API key** que aparecer (public_key e secret_key) para testar a API depois.

---

## Passo 2.6 – Iniciar a API (servidor do backend)

1. **Onde:** terminal **dentro da pasta backend**.
2. Digite:
   ```powershell
   npm run start:dev
   ```
   **Enter.**

3. **O que deve acontecer:** a API sobe e fica “rodando”. Vai aparecer texto tipo “NEXGATE API running at http://localhost:4000/api”.  
   **Deixe essa janela aberta.** Não feche esse terminal.  
   Para testar: abra o navegador em **http://localhost:4000/api/health**. Deve retornar algo como `{"status":"ok",...}`.

---

## Passo 2.7 – Abrir um SEGUNDO terminal e iniciar o Worker

1. No Cursor: **Terminal** → **New Terminal** (ou no menu do terminal, clique no **+** para nova aba).
2. Nesse **novo** terminal, entre na pasta do projeto e depois na backend:
   ```powershell
   cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
   ```
   **Enter.**

3. Digite:
   ```powershell
   npm run worker:dev
   ```
   **Enter.**

4. **O que deve acontecer:** aparece algo como “NEXGATE Worker running (webhook-deliveries)”.  
   **Deixe esse segundo terminal aberto também.**  
   O primeiro terminal continua com a API; o segundo com o worker.

---

## Passo 2.8 – Abrir um TERCEIRO terminal e iniciar o frontend

1. No Cursor: **Terminal** → **New Terminal** de novo (terceira aba/janela).
2. Nesse **novo** terminal:
   ```powershell
   cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\frontend"
   ```
   **Enter.**

3. Instalar dependências do frontend (só na primeira vez):
   ```powershell
   npm install
   ```
   **Enter.**  
   Espere terminar.

4. Iniciar o frontend:
   ```powershell
   npm run dev
   ```
   **Enter.**

5. **O que deve acontecer:** aparece algo como “Ready on http://localhost:3000”.  
   Abra o navegador em **http://localhost:3000**.  
   Deve abrir a tela de login do NEXGATE.  
   **Logins (depois do seed):**
   - Admin: `admin@nexgate.local` / `admin123`
   - Merchant demo: `demo@nexgate.local` / `demo123`

---

## Resumo do que fica aberto

- **Terminal 1:** `npm run start:dev` (backend API) – não fechar.
- **Terminal 2:** `npm run worker:dev` (worker) – não fechar.
- **Terminal 3:** `npm run dev` (frontend) – não fechar.
- **Navegador:** http://localhost:3000 para usar o painel.

Tudo isso é **dentro da pasta do projeto** (raiz, `backend` ou `frontend`), sempre no **terminal** (Cursor ou PowerShell), um comando por vez, na ordem acima.

---

## Se algo der errado

- **“comando não encontrado” (git, npm, docker):** o programa não está instalado ou não está no PATH. Instale Git, Node.js ou Docker e, se precisar, reinicie o terminal.
- **Erro de porta (port already in use):** algo já está usando a porta (ex.: 4000 ou 3000). Feche outros programas que usem essa porta ou mate o processo que está usando.
- **Erro de banco (connection refused, password):** o Docker não está rodando ou o `.env` está errado. Confira se o `docker-compose up -d` rodou e se o arquivo `.env` existe dentro de `backend`.

Se quiser, na próxima mensagem você pode dizer em qual passo parou e qual mensagem apareceu que eu te ajudo a corrigir.
