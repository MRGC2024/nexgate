# Onde ver o erro 500 (login) – Railway

O **console do navegador** só mostra que a API respondeu 500. O **erro real** (mensagem e stack) aparece nos **logs do servidor** no Railway.

---

## Passo a passo

1. Acesse **https://railway.app** e entre no seu projeto.
2. Clique no serviço da **API** (o que tem o domínio `nexgate-production.up.railway.app` – não Postgres, não Redis, não Worker).
3. Abra a aba **"Logs"** (ou **"Deployments"** → último deploy → **"View Logs"**).
4. Deixe a tela de logs aberta e **tente fazer login de novo** no site (Vercel).
5. Nos logs do Railway deve aparecer uma linha com **`LOGIN_ERROR:`** ou um **stack trace** (pilha de erro). Essa é a causa do 500.
6. **Copie** essa mensagem (ou tire um print) e envie para quem está te ajudando – assim dá para corrigir o código ou a configuração.

---

## Se não aparecer nada nos logs

- Confirme que está vendo os logs do serviço **API** (não do Worker nem do Postgres).
- Tente o login de novo com a aba de logs já aberta.
- Se o deploy for muito antigo, faça um **Redeploy** do serviço da API (para subir o código que grava `LOGIN_ERROR` nos logs).

---

## Erro "relation \"users\" does not exist"

Significa que **as tabelas não existem** no banco do Railway (migrações nunca rodaram nesse banco). Rode **no seu PC** com a **mesma** `DATABASE_URL` que está na API no Railway:

```powershell
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
$env:DATABASE_URL = "postgresql://..."   # cole a URL do Postgres do Railway
npm run migrate:run
npm run seed
```

Guia completo: **[CORRIGIR-RELATION-USERS-NAO-EXISTE.md](CORRIGIR-RELATION-USERS-NAO-EXISTE.md)**.

---

## Causa comum: seed não rodou no banco do Railway

Se não existem usuários (admin/demo) no banco que a API usa, o login pode falhar de formas estranhas. Rode **uma vez** no seu PC, com a **mesma** `DATABASE_URL` que está na API no Railway:

```powershell
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY\backend"
$env:DATABASE_URL = "postgresql://..."   # cole a URL do Postgres do Railway
npm run migrate:run
npm run seed
```

Depois tente o login de novo com **admin@nexgate.local** / **admin123**.
