# Corrigir "Failed to fetch" no login (Vercel + Railway)

O frontend na Vercel abre, mas ao clicar em **Entrar** aparece **Failed to fetch**. Isso significa que o navegador não consegue chamar a API no Railway. Ajuste estes dois lados:

---

## 1. Vercel – URL da API

O frontend precisa saber **para onde** mandar as requisições (login, etc.).

1. Acesse **https://vercel.com** → seu projeto **nexgate**.
2. **Settings** → **Environment Variables**.
3. Confira a variável **`NEXT_PUBLIC_API_URL`**:
   - **Valor correto:** a URL da API no Railway **com `/api` no final**.
   - Exemplo: `https://nexgate-api-production-xxxx.up.railway.app/api`
   - Sem barra no final: ~~`.../api/`~~
4. Se não existir ou estiver errada, **adicione/edite** e salve.
5. **Deployments** → último deploy → **⋮** → **Redeploy** (para a variável valer no build).

---

## 2. Railway – CORS (permitir o front da Vercel)

A API no Railway só aceita requisições de origens que estiverem em **CORS_ORIGINS**. Se o site da Vercel não estiver lá, o navegador bloqueia e dá "Failed to fetch".

1. Acesse **https://railway.app** → seu projeto → serviço da **API** (não Postgres, não Redis, não Worker).
2. Aba **Variables** (variáveis de ambiente).
3. Confira **`CORS_ORIGINS`**:
   - **Valor correto:** a URL do front na Vercel, **sem barra no final**.
   - Exemplo: `https://nexgate.vercel.app`
   - Se você usa **dois** domínios (principal + preview), pode colocar os dois separados por vírgula:  
     `https://nexgate.vercel.app,https://nexgate-75eb5jtal-marcelo-santanas-projects-c27e3139.vercel.app`
4. Salve. O Railway faz um novo deploy da API sozinho.
5. Espere 1–2 minutos e tente o login de novo no site.

---

## Resumo

| Onde     | Variável               | Exemplo de valor |
|----------|------------------------|-------------------|
| **Vercel**  | `NEXT_PUBLIC_API_URL`  | `https://SUA-API.up.railway.app/api` |
| **Railway** | `CORS_ORIGINS`         | `https://nexgate.vercel.app` |

- **Vercel:** URL da **API** (Railway) + **`/api`** no final.
- **Railway:** URL do **site** (Vercel), sem barra no final.

Depois de ajustar os dois, faça **Redeploy** na Vercel e espere o redeploy da API no Railway. Em seguida teste o login de novo.
