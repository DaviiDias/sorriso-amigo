# Validacao de Funcionamento e Base de Dados

## Escopo da validacao

- Execucao tecnica da aplicacao sem erros aparentes em testes livres.
- Confirmacao de leitura e gravacao na base de dados.

## Evidencias tecnicas executadas

Data: 2026-04-06

### 1) Checagem de sintaxe

Comandos executados:

```bash
node --check code/assets/script.js
node --check server/src/app.js
```

Resultado:

- Sem erros de sintaxe.

### 2) Inicializacao da API

Comando executado (com variaveis locais):

```bash
node server/src/server.js
```

Resultado:

- API iniciou e exibiu mensagem de subida do servidor.
- Endpoint `/api/health` retornou `status: ok`.

### 3) Validacao do docker compose

Comando executado:

```bash
docker compose config
```

Resultado:

- Arquivo de compose valido.

## Validacao de leitura e gravacao no banco

### Status atual

- **Execucao iniciada, mas nao concluida neste ambiente** por indisponibilidade do backend com banco ativo.

Erro observado:

- Nao foi possivel conectar ao engine `dockerDesktopLinuxEngine`.
- No `npm run smoke:db`, houve falha de conexao HTTP (`fetch failed`) por API/BD indisponiveis no momento da chamada.

### Como executar a validacao completa (passo a passo)

1. Inicie o Docker Desktop.
2. Suba o ambiente:

```bash
docker compose up -d --build
```

3. Em outro terminal, execute os testes manuais da API:

- Cadastro
- Login
- Gravacao de checklist (`PUT /api/checklists/:date`)
- Leitura de checklist (`GET /api/checklists`)

4. Validacao esperada:

- O checklist salvo deve aparecer na leitura.
- Os indicadores do dashboard devem refletir os dados gravados.

### Script de validacao automatica disponivel

Com API+BD ativos:

```bash
cd server
npm run smoke:db
```

Esse script valida:

- cadastro de usuario,
- login/autenticacao,
- gravacao do checklist,
- leitura do checklist gravado,
- leitura de estatisticas.

## Conclusao

- Aplicacao pronta para validacao integrada com banco.
- Camadas frontend, API e persistencia foram implementadas.
- Falta apenas executar o ciclo integrado no ambiente com Docker Engine ativo para registrar a evidencia final de BD neste documento.
