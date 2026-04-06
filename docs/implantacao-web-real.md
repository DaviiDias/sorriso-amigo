# Implantacao em servidor real

Este projeto ja esta preparado para publicar com URL real HTTPS.

## Opcao 1: Render (simples e rapido)

### 1) Banco PostgreSQL

- Crie um Postgres no Render (ou Neon/Supabase)
- Copie a `DATABASE_URL`

### 2) Publicar aplicacao web

- Crie um novo Web Service apontando para este repositorio
- Build command:

```bash
npm install
```

- Start command:

```bash
npm run db:init && npm start
```

- Root directory: `server`

### 3) Variaveis de ambiente

Configure no painel:

- `PORT=4000`
- `DATABASE_URL=<url do postgres>`
- `DATABASE_SSL=true`
- `JWT_SECRET=<chave forte com 32+ caracteres>`
- `FRONTEND_ORIGIN=https://seu-dominio.com`
- `NODE_ENV=production`

### 4) Dominio real

- No painel Render, adicione custom domain
- Exemplo: `app.sorrisoamigo.org`
- Configure DNS (CNAME/A) conforme instrucoes do provedor
- TLS/HTTPS e emitido automaticamente

## Opcao 2: VPS com Docker + dominio proprio

### 1) Servidor

- Ubuntu 22.04+
- Docker + Docker Compose instalados

### 2) Deploy

```bash
git clone <seu-repo>
cd sorriso-amigo
docker compose up -d --build
```

### 3) Reverse proxy HTTPS

Use Nginx com Certbot para TLS:

- Proxy para `http://127.0.0.1:4000`
- Certificado Let's Encrypt

### 4) DNS

- Aponte `A` record do dominio para IP da VPS
- Exemplo: `app.sorrisoamigo.org`

## Boas praticas de producao

- Trocar senha default do Postgres
- Gerar `JWT_SECRET` forte
- Habilitar backup diario do banco (30 dias)
- Ativar monitoramento de disponibilidade (meta 99.5%+)
- Usar logs e alertas para erros de API
