# Sorriso Amigo

Plataforma web para educacao e acompanhamento de saude bucal para pessoas com TEA, com foco em familiares, cuidadores e profissionais.

## Escopo implementado

- Autenticacao com JWT e senha criptografada
- Checklist diario de escovacao (manha, tarde, noite + nivel de resistencia)
- Dashboard com taxa de adesao mensal e historico recente
- Guia ludico de escovacao com etapas ilustradas
- Quiz educativo com feedback imediato e historico de tentativas
- Biblioteca de videos educativos
- Configuracoes de lembrete, acessibilidade e termo de uso
- API REST + banco relacional PostgreSQL
- Estrutura pronta para deploy em servidor real na web

## Arquitetura

- Frontend: HTML, CSS e JavaScript em [code](code)
- Backend: Node.js + Express em [server](server)
- Banco: PostgreSQL com schema em [server/sql/schema.sql](server/sql/schema.sql)

## Subir local com Docker

### 1) Requisito

- Docker Desktop instalado

### 2) Executar

```bash
docker compose up --build
```

### 3) Acessar

- App web: http://localhost:4000
- Health check da API: http://localhost:4000/api/health

## Rodar sem Docker (manual)

### 1) Banco PostgreSQL

Crie um banco e configure a URL em `server/.env` (use `server/.env.example` como base).

### 2) Backend

```bash
cd server
npm install
npm run db:init
npm run dev
```

### 3) Frontend

O frontend e servido automaticamente pelo backend em `/`.

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/checklists`
- `PUT /api/checklists/:date`
- `GET /api/checklists/stats`
- `GET /api/guide/steps`
- `GET /api/quiz/questions`
- `POST /api/quiz/submit`
- `GET /api/quiz/history`
- `GET /api/videos`
- `GET /api/user/preferences`
- `PUT /api/user/preferences`

## Deploy com endereco real na web

Veja o guia em [docs/implantacao-web-real.md](docs/implantacao-web-real.md).

## Acompanhamento e governanca

- Controle de versao da entrega: [docs/controle-de-versao-entrega.md](docs/controle-de-versao-entrega.md)
- Quadro de iteracao: [docs/quadro-acompanhamento-iteracao-01.md](docs/quadro-acompanhamento-iteracao-01.md)
- Validacao tecnica e BD: [docs/validacao-funcionamento-e-bd.md](docs/validacao-funcionamento-e-bd.md)
- Guia do usuario: [docs/guia-do-usuario.md](docs/guia-do-usuario.md)

## Smoke test de leitura e gravacao no banco

Com backend e banco em execucao:

```bash
cd server
npm run smoke:db
```

Esse teste automatiza cadastro, login, gravacao de checklist e leitura para confirmar persistencia.
