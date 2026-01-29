# Corrigir: "relation \"users\" does not exist"

Esse erro nos logs do Railway significa: **as tabelas não existem** no banco do Postgres que a API usa. O banco está vazio (ou só foi criado), e as **migrações nunca foram rodadas** nesse banco.

---

## O que fazer (uma vez, no seu PC)

Você precisa **rodar as migrações e o seed** no seu computador, usando a **mesma** `DATABASE_URL` que está no serviço da **API** no Railway (a URL do Postgres do Railway).

### 1. Pegar a DATABASE_URL no Railway

1. Acesse **https://railway.app** → seu projeto.
2. Clique no serviço **PostgreSQL** (não na API).
3. Aba **Variables** (ou **Connect**).
4. Copie o valor de **DATABASE_URL** (ou **POSTGRES_URL** / **PGURL**). É uma URL longa que começa com `postgresql://`.

### 2. Rodar no PowerShell (ou terminal do Cursor)

Abra o PowerShell, cole e execute **um bloco por vez** (troque a URL pela que você copiou):

```powershell
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
```

```powershell
$env:DATABASE_URL = "postgresql://postgres:SUA_SENHA@HOST.railway.app:PORT/railway?sslmode=require"
```

*(Substitua toda a URL pela que você copiou do Railway. Não use "SUA_SENHA" literal.)*

```powershell
npm run migrate:run
```

Espere aparecer algo como: **"Migration ... has been executed successfully"**.

```powershell
npm run seed
```

Espere aparecer: **"Seed concluído."** e as credenciais (admin@nexgate.local / admin123).

### 3. Se der "self-signed certificate in certificate chain"

O backend foi ajustado para aceitar o certificado do Railway ao rodar migrate/seed do PC. **Atualize o código** (git pull ou pegue a versão mais recente do repo) e rode de novo:

```powershell
$env:DATABASE_URL = "sua-url-publica?sslmode=require"
npm run migrate:run
npm run seed
```

Se ainda falhar, rode com Node aceitando certificado (só para esse comando):

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npm run migrate:run
npm run seed
$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"
```

### 4. Testar o login

Abra o site na Vercel e faça login com **admin@nexgate.local** / **admin123**. O erro "relation users does not exist" deve sumir.

---

## Resumo

| Erro nos logs | Causa | Solução |
|---------------|--------|---------|
| `relation "users" does not exist` | Tabelas não existem no banco do Railway | Rodar `migrate:run` e `seed` no PC com a DATABASE_URL do Railway |

A **DATABASE_URL** que você usar no PC tem que ser **exatamente** a mesma que está nas **Variables** do serviço da **API** no Railway (a que veio do Postgres).
