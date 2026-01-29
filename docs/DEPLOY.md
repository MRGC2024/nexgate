# NEXGATE – Deploy (HiUI / produção)

Guia para deploy em servidor Linux com Nginx, PM2 e Let's Encrypt.

## Requisitos

- Servidor com Node.js 18+, PostgreSQL 15+, Redis
- Domínio apontando para o servidor (ex.: `api.nexgate.com`, `app.nexgate.com`)

## Variáveis de ambiente

Crie `.env` no servidor (ou use o método do seu provedor):

```env
NODE_ENV=production
PORT=4000
APP_URL=https://api.nexgate.com

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=nexgate
DATABASE_PASSWORD=<senha-forte>
DATABASE_NAME=nexgate

REDIS_URL=redis://localhost:6379

JWT_SECRET=<min-32-caracteres-aleatorios>
JWT_EXPIRES_IN=1h
MASTER_KEY_ENCRYPTION=<chave-32-bytes-criptografia>
WEBHOOK_SIGNING_SECRET=<segredo-hmac-webhooks>

CORS_ORIGINS=https://app.nexgate.com
```

## Build e start

```bash
cd backend
npm ci --omit=dev
npm run build
npm run migrate:run
# seed apenas na primeira vez: npm run seed
```

## PM2

Arquivo `ecosystem.config.cjs` (na raiz do backend):

```javascript
module.exports = {
  apps: [
    {
      name: 'nexgate-api',
      script: 'dist/main.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'nexgate-worker',
      script: 'dist/worker/main.js',
      cwd: './backend',
      instances: 1,
      env: { NODE_ENV: 'production' },
    },
  ],
};
```

Comandos:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## Nginx (reverse proxy)

Exemplo para API em `api.nexgate.com`:

```nginx
server {
    listen 80;
    server_name api.nexgate.com;
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.nexgate.com;

    ssl_certificate     /etc/letsencrypt/live/api.nexgate.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nexgate.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d api.nexgate.com
# Renovação automática: certbot renew (cron)
```

## Backups Postgres

Dump diário (cron, ex.: 2h):

```bash
0 2 * * * pg_dump -U nexgate nexgate | gzip > /backups/nexgate-$(date +\%Y\%m\%d).sql.gz
```

## Logs

- PM2: `pm2 logs`
- Nginx: `/var/log/nginx/access.log`, `error.log`
- Rotação: configurar logrotate para PM2 e Nginx

## Healthcheck

- Liveness: `GET /api/health/live`
- Readiness: `GET /api/health/ready`
- Full: `GET /api/health`

Usar em load balancer ou orquestrador (Kubernetes/Docker) para health checks.
