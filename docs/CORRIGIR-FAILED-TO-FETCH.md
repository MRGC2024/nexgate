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

---

## Ainda dá "Failed to fetch"? Checklist

1. **Redeploy na Vercel depois de mudar variável**  
   `NEXT_PUBLIC_API_URL` é usada no **build**. Se você alterou depois do último deploy, precisa em **Deployments** → **⋮** → **Redeploy**. Senão o site continua com a URL antiga (ou vazia).

2. **URL que o front está usando**  
   Na tela de login, quando der o erro, aparece **"URL usada: ..."** e um link **"Abrir /health no navegador"**. Clique nesse link:
   - Se **abrir e mostrar JSON** (ex.: `{"status":"ok"}`) → a API está no ar; o problema é **CORS** (veja o item 3).
   - Se **não abrir / der erro de rede** → a URL pode estar errada ou a API no Railway pode estar fora do ar; confira a URL e os logs do serviço da API no Railway.

3. **CORS_ORIGINS tem que ser a URL exata do site**  
   A URL que está **na barra de endereço** quando você abre o painel (ex.: `https://nexgate.vercel.app` ou `https://nexgate-75eb5jtal-....vercel.app`) tem que estar em **CORS_ORIGINS** no Railway, **igual**, sem barra no final e com `https://`. Se você abre por um link e a URL é outra, coloque essa outra em **CORS_ORIGINS** também (pode ser mais de uma separada por vírgula).

4. **API no Railway**  
   No Railway, no serviço da **API**, abra **Deployments** ou **Logs** e veja se o deploy está **Success** e se não há erro de variável (ex.: `DATABASE_URL`, `REDIS_URL`). Se a API não sobe, o front sempre dá "Failed to fetch".
