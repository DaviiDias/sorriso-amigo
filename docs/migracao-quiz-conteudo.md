# Migração 002 — conteúdo do Quiz (F05)

Atualiza as 12 perguntas e 48 alternativas do Quiz sem apagar histórico.

## Quando usar

- **Base existente:** execute somente `server/sql/migrations/002_update_quiz_content.sql`.
- **Base fresh:** use `server/sql/seed.sql` (ele ainda contém `TRUNCATE ... CASCADE` e **não** deve rodar em base com histórico).
- Não execute `seed.sql` em produção nem em banco com tentativas/respostas.

O runner F04 (`npm run db:migrate` / `server/scripts/migrate.js`) aplica `001` e `002` em uma transação única e registra `schema_migrations`. **Não** use `seed.sql` nem `db:init` em base existente.

## Como aplicar (manual)

```bash
# Preferencial (runner dono da transacao, nao executa seed):
npm run db:migrate --prefix server

# Avulsa: envolva em transacao. O arquivo 002 NAO traz BEGIN/COMMIT internos
# para nao quebrar o controle de schema_migrations do runner.
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
\i server/sql/migrations/002_update_quiz_content.sql
COMMIT;
SQL
```

Pode ser reaplicado: é idempotente para o corpus 1..12. O runner ignora arquivos já presentes em `schema_migrations`.

## O que a 002 faz

- Mantém IDs das perguntas `1..12`.
- Atualiza enunciado, categoria, `image_url` e textos das quatro primeiras opções de cada pergunta, na ordem estável `ORDER BY quiz_options.id ASC`.
- Copia a justificativa completa do documento para todas as opções da questão (o gabarito continua em uma única `is_correct`).
- Se faltar alguma das quatro posições, **insere** a opção que falta. Não apaga opções extras.
- Opções além da 4ª deixam de ser gabarito (`is_correct = false`) e permanecem para não quebrar FK de `quiz_attempt_answers`.
- Não usa `TRUNCATE`, `DELETE` nem `CASCADE` em histórico.

## Limites do histórico

Tentativas antigas continuam apontando para os mesmos `question_id` / `selected_option_id`. O **significado textual** da opção pode mudar (o enunciado e as alternativas foram atualizados pelo material da Carol). A pontuação gravada (`quiz_attempts.score`) **não é recalculada**.

Gabarito novo: **B C C A C B C C B C B B**.

## Verificação rápida

```sql
SELECT id, category, image_url FROM quiz_questions ORDER BY id;
SELECT question_id, id, option_text, is_correct
FROM quiz_options
ORDER BY question_id, id;
SELECT COUNT(*) FROM quiz_attempt_answers;
```

Confirme 12 perguntas, 4 alternativas corretas no total (uma por questão) e que tentativas/respostas antigas ainda existem.
