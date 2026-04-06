# Quadro de Acompanhamento - Iteracao 01

## Objetivo da iteracao

Entregar a primeira versao funcional do Sorriso Amigo com autenticacao, dashboard, checklist, guia, quiz, videos, configuracoes, backend API e estrutura de deploy.

## Planejamento inicial

Data de planejamento: 2026-04-04

| ID | Tarefa | Responsavel | Status inicial | Prioridade |
|---|---|---|---|---|
| IT01-01 | Estruturar backend Node/Express | Time | Planejado | Alta |
| IT01-02 | Implementar autenticacao JWT | Time | Planejado | Alta |
| IT01-03 | Implementar modulo Checklist + estatisticas | Time | Planejado | Alta |
| IT01-04 | Implementar modulo Guia | Time | Planejado | Media |
| IT01-05 | Implementar modulo Quiz + historico | Time | Planejado | Alta |
| IT01-06 | Implementar modulo Videos | Time | Planejado | Media |
| IT01-07 | Implementar Configuracoes e Acessibilidade | Time | Planejado | Media |
| IT01-08 | Criar frontend responsivo | Time | Planejado | Alta |
| IT01-09 | Criar SQL schema + seed | Time | Planejado | Alta |
| IT01-10 | Criar arquivos de deploy e documentacao | Time | Planejado | Alta |
| IT01-11 | Executar validacoes tecnicas | Time | Planejado | Alta |

## Atualizacoes durante a execucao

Data de atualizacao: 2026-04-06

| ID | Atualizacao | Status atual | Evidencia |
|---|---|---|---|
| IT01-01 | Estrutura de backend criada em server/src | Concluida | server/src |
| IT01-02 | Rotas auth (register/login/me) com JWT e bcrypt | Concluida | server/src/routes/auth.routes.js |
| IT01-03 | Checklist diario + endpoint de stats mensal | Concluida | server/src/routes/checklist.routes.js |
| IT01-04 | Guia por etapas implementado | Concluida | server/src/routes/guide.routes.js |
| IT01-05 | Quiz com avaliacao, feedback e historico | Concluida | server/src/routes/quiz.routes.js |
| IT01-06 | Videos educativos implementados | Concluida | server/src/routes/videos.routes.js |
| IT01-07 | Preferencias e acessibilidade implementadas | Concluida | server/src/routes/user.routes.js, code/assets/style.css |
| IT01-08 | Frontend completo com abas e navegacao | Concluida | code/index.html, code/assets/script.js |
| IT01-09 | Banco relacional e carga inicial criados | Concluida | server/sql/schema.sql, server/sql/seed.sql |
| IT01-10 | Docker, compose e docs de deploy criados | Concluida | server/Dockerfile, docker-compose.yml, docs/implantacao-web-real.md |
| IT01-11 | Checagens executadas (sintaxe, compose, startup) | Parcial | docs/validacao-funcionamento-e-bd.md |

## Observacoes de acompanhamento

- O ambiente local permitiu validacao de sintaxe e startup da API.
- A validacao integrada com banco foi preparada e depende apenas de engine Docker ativa ou PostgreSQL local ativo.
- O projeto possui modo demonstracao no frontend para inspecao visual completa sem backend.
