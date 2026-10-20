# Migração F04 — resistência do responsável

O checklist passa a registrar dois níveis independentes:

- `resistance_level`: pessoa com TEA (obrigatório; os 4 valores `none`, `light`, `moderate`, `severe`)
- `caregiver_resistance_level`: responsável (os mesmos 4 valores **ou** `NULL`)

`NULL` significa **Não informado**. Não deve ser preenchido automaticamente com `none`/`Nenhuma`.

## Instalação limpa

```bash
cd server
npm run db:init
```

Isso aplica `sql/schema.sql` (já inclui a coluna e a constraint nomeada) e em seguida `sql/seed.sql`.

`db:init` **não** deve ser usado em base com histórico: `seed.sql` contém `TRUNCATE ... CASCADE` em guia, quiz e vídeos.

## Base já existente

Não execute `npm run db:init`. Use o runner incremental, transacional e rastreado em `schema_migrations`:

```bash
cd server
npm run db:migrate
```

O comando aplica `server/sql/migrations/*.sql` na ordem, ignora arquivos já registrados e **não** executa `seed.sql`. Pode ser rodado mais de uma vez.

A migração `001_add_caregiver_resistance.sql`:

- adiciona `caregiver_resistance_level` se a coluna ainda não existir
- cria a constraint `daily_checklists_caregiver_resistance_level_check` (4 valores ou NULL)
- não faz `TRUNCATE`, `DELETE` nem `CASCADE` em `daily_checklists`

Registros anteriores permanecem com o responsável em `NULL` (exibido como “Não informado”).

## Contrato da API

- `GET /api/checklists` e `PUT /api/checklists/:date` transportam `caregiver_resistance_level`
- `PUT` com `caregiverResistanceLevel` omitido **não** apaga um valor já salvo
- `PUT` com `caregiverResistanceLevel: null` grava não informado de forma explícita
- `stats.resistance` continua sendo só da pessoa com TEA
