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

## Marcos de versionamento

- Tag v1: referencia a entrega da Iteracao 1
- Tag v2: referencia a entrega da Iteracao 2
- Branch iteracao2: exercicio com ajustes pontuais e merge para master

## Como executar no computador pessoal

### Requisitos

- Git
- Docker Desktop 4.x ou superior
- Caso rode sem Docker: Node.js 20+ e PostgreSQL 14+ localmente

### 1) Clonar o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
cd sorriso-amigo
```

### 2) Verificar a versao entregue

```bash
git checkout v2
```

Se o objetivo for apenas validar o codigo da Iteracao 2, esse comando coloca o repositorio exatamente na versao entregue.

### 3) Executar com Docker

1. Crie o arquivo `server/.env` com base em `server/.env.example`.
2. Ajuste a senha do banco e o `JWT_SECRET` se necessario.
3. Suba a aplicacao:

```bash
docker compose up --build
```

4. Acesse:

- Aplicacao web: http://localhost:4000
- Health check: http://localhost:4000/api/health

### 4) Executar sem Docker

1. Inicie o PostgreSQL localmente.
2. Crie o banco `sorriso_amigo`.
3. Configure `server/.env` com os dados do banco.
4. Instale as dependencias do backend:

```bash
cd server
npm install
```

5. Inicialize o schema e os dados de apoio:

```bash
npm run db:init
```

6. Inicie o backend:

```bash
npm run dev
```

7. Abra o frontend em:

- http://localhost:4000

### 5) Validacao local

Com a API e o banco em execucao, rode:

```bash
cd server
npm run smoke:db
```

Esse comando valida cadastro, login, gravacao e leitura de checklist, alem de estatisticas basicas.

## Rodar sem Docker (manual)

O passo a passo detalhado esta na secao "Como executar no computador pessoal".

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
