-- 002_update_quiz_content.sql
-- Atualiza o corpus do Quiz (12 perguntas / 48 alternativas) de forma idempotente.
-- Preserva IDs de perguntas e opcoes existentes, tentativas, respostas e pontuacao.
-- Nao executa TRUNCATE, DELETE, CASCADE nem remove historico.
-- Destinado a bases existentes; bases novas devem usar server/sql/seed.sql (fresh).
-- F04 usa 001; este arquivo e 002 para evitar colisao.
-- Sem BEGIN/COMMIT internos: o runner (server/scripts/migrate.js) e dono da transacao.
-- Execucao avulsa deve ser envolvida em transacao (psql -v ON_ERROR_STOP=1 + BEGIN/COMMIT).
-- Tabelas temporarias NAO usam ON COMMIT DROP para sobreviver a statements isolados;
-- dentro da transacao do runner elas caem no COMMIT/ROLLBACK.

CREATE TEMP TABLE quiz_question_updates (
  question_id INT PRIMARY KEY,
  question_text TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  image_url TEXT
);

INSERT INTO quiz_question_updates (question_id, question_text, category, image_url)
VALUES
    (1, 'O Transtorno do Espectro Autista (TEA) é definido como:', 'Compreensão do Transtorno do Espectro Autista (TEA)', './assets/quiz/questao-01.jpeg'),
    (2, 'A frequência da escovação dentária é um fator determinante na prevenção de desordens na cavidade oral. Qual é a recomendação mais adequada?', 'Higiene Bucal', './assets/quiz/questao-02.jpeg'),
    (3, 'Considerando a hipersensibilidade sensorial frequentemente observada em indivíduos com TEA, qual é o tipo de escova dental mais indicado?', 'Higiene Bucal', './assets/quiz/questao-03.jpeg'),
    (4, 'A pasta de dente deve conter flúor?', 'Higiene Bucal', './assets/quiz/questao-04.jpeg'),
    (5, 'A dieta influencia diretamente a saúde bucal. Qual dos seguintes grupos alimentares apresenta maior risco cariogênico quando consumido com frequência?', 'Alimentação e Saúde Bucal', './assets/quiz/questao-05.jpeg'),
    (6, 'O que pode causar com o consumo frequente de açúcar na cavidade oral?', 'Alimentação e Saúde Bucal', './assets/quiz/questao-06.jpeg'),
    (7, 'Como agir diante da resistência à escovação?', 'Manejo Comportamental no TEA', './assets/quiz/questao-07.jpeg'),
    (8, 'Qual é a forma mais adequada de reforço após a escovação?', 'Manejo Comportamental no TEA', './assets/quiz/questao-08.jpeg'),
    (9, 'Em indivíduos com TEA não verbais, qual sinal pode indicar dor odontológica?', 'Manejo Comportamental no TEA', './assets/quiz/questao-09.jpeg'),
    (10, 'Qual é a periodicidade recomendada de consultas odontológicas preventivas para indivíduos com TEA?', 'Atenção Odontológica Preventiva', './assets/quiz/questao-10.jpeg'),
    (11, 'Qual estratégia favorece a cooperação durante a higiene bucal em indivíduos com TEA?', 'Atenção Odontológica Preventiva', './assets/quiz/questao-11.jpeg'),
    (12, 'Qual hábito pode causar desgaste no dente em indivíduos com TEA?', 'Atenção Odontológica Preventiva', './assets/quiz/questao-12.jpeg');

CREATE TEMP TABLE quiz_option_updates (
  question_id INT NOT NULL,
  position INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  explanation TEXT NOT NULL,
  PRIMARY KEY (question_id, position)
);

INSERT INTO quiz_option_updates (question_id, position, option_text, is_correct, explanation)
VALUES
    (1, 1, 'Uma doença contagiosa', FALSE, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
    (1, 2, 'Um transtorno do neurodesenvolvimento', TRUE, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
    (1, 3, 'Uma doença exclusivamente genética', FALSE, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
    (1, 4, 'Uma deficiência sensorial isolada', FALSE, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
    (2, 1, 'Uma vez ao dia, preferencialmente à noite', FALSE, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
    (2, 2, 'Duas vezes ao dia, de manhã e à noite', FALSE, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
    (2, 3, 'Três vezes ao dia, após as principais refeições', TRUE, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
    (2, 4, 'Apenas quando houver solicitação da criança', FALSE, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
    (3, 1, 'Cerdas duras e cabeça grande', FALSE, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
    (3, 2, 'Cerdas médias e cabeça grande', FALSE, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
    (3, 3, 'Cerdas macias e cabeça pequena', TRUE, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
    (3, 4, 'Qualquer escova apresenta a mesma eficácia', FALSE, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
    (4, 1, 'Sim', TRUE, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
    (4, 2, 'Não', FALSE, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
    (4, 3, 'Apenas para adultos', FALSE, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
    (4, 4, 'Apenas para crianças', FALSE, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
    (5, 1, 'Alimentos naturais e minimamente processados', FALSE, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
    (5, 2, 'Frutas fibrosas', FALSE, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
    (5, 3, 'Alimentos açucarados e ultraprocessados', TRUE, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
    (5, 4, 'Laticínios', FALSE, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
    (6, 1, 'Fortalecimento dentário', FALSE, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
    (6, 2, 'Desenvolvimento de cárie dentária', TRUE, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
    (6, 3, 'Crescimento dentário', FALSE, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
    (6, 4, 'Clareamento natural dos dentes', FALSE, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
    (7, 1, 'Suspender a escovação', FALSE, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
    (7, 2, 'Realizar a escovação de forma forçada', FALSE, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
    (7, 3, 'Introduzir a escovação gradualmente com reforço positivo', TRUE, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
    (7, 4, 'Reduzir a frequência da escovação', FALSE, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
    (8, 1, 'Ausência de reforço', FALSE, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
    (8, 2, 'Oferta de alimentos açucarados', FALSE, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
    (8, 3, 'Reforço positivo imediato, com elogios ou atividades prazerosas', TRUE, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
    (8, 4, 'Redução da frequência de escovação', FALSE, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
    (9, 1, 'Esfoliação dentária fisiológica', FALSE, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
    (9, 2, 'Irritabilidade associada a comportamentos repetitivos na face', TRUE, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
    (9, 3, 'Preferência alimentar habitual', FALSE, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
    (9, 4, 'Manchas iniciais no esmalte', FALSE, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
    (10, 1, 'Apenas em situações de dor', FALSE, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
    (10, 2, 'Anualmente', FALSE, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
    (10, 3, 'A cada seis meses', TRUE, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
    (10, 4, 'Desnecessária com boa higiene', FALSE, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
    (11, 1, 'Impor a escovação', FALSE, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
    (11, 2, 'Uso de recursos visuais e educativos', TRUE, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
    (11, 3, 'Realização da escovação quando a criança pedir', FALSE, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
    (11, 4, 'Suspensão em dias de resistência', FALSE, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
    (12, 1, 'Escovar os dentes três vezes ao dia', FALSE, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.'),
    (12, 2, 'Consumo frequente de bebidas ácidas, como sucos industrializados', TRUE, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.'),
    (12, 3, 'Mastigar alimentos fibrosos, como frutas', FALSE, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.'),
    (12, 4, 'Uso regular de flúor', FALSE, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.');

-- Evita colisao da UNIQUE(question_text) durante a troca de enunciados.
UPDATE quiz_questions q
SET question_text = q.question_text || '::__tmp_' || q.id::text
WHERE q.id IN (SELECT question_id FROM quiz_question_updates);

INSERT INTO quiz_questions (id, question_text, category, image_url)
SELECT u.question_id, u.question_text, u.category, u.image_url
FROM quiz_question_updates u
WHERE NOT EXISTS (
  SELECT 1 FROM quiz_questions q WHERE q.id = u.question_id
);

UPDATE quiz_questions q
SET
  question_text = u.question_text,
  category = u.category,
  image_url = u.image_url
FROM quiz_question_updates u
WHERE q.id = u.question_id;

-- Evita colisao da UNIQUE(question_id, option_text) durante a troca de alternativas.
WITH ranked AS (
  SELECT
    o.id,
    ROW_NUMBER() OVER (PARTITION BY o.question_id ORDER BY o.id ASC) AS position
  FROM quiz_options o
  WHERE o.question_id IN (SELECT question_id FROM quiz_question_updates)
)
UPDATE quiz_options o
SET option_text = o.option_text || '::__tmp_' || o.id::text
FROM ranked r
WHERE o.id = r.id
  AND r.position BETWEEN 1 AND 4;

WITH ranked AS (
  SELECT
    o.id,
    o.question_id,
    ROW_NUMBER() OVER (PARTITION BY o.question_id ORDER BY o.id ASC) AS position
  FROM quiz_options o
  WHERE o.question_id IN (SELECT question_id FROM quiz_question_updates)
)
UPDATE quiz_options o
SET
  option_text = u.option_text,
  is_correct = u.is_correct,
  explanation = u.explanation
FROM ranked r
JOIN quiz_option_updates u
  ON u.question_id = r.question_id
 AND u.position = r.position
WHERE o.id = r.id;

-- Completa alternativas ausentes sem apagar as existentes (protege FKs/historico).
INSERT INTO quiz_options (question_id, option_text, is_correct, explanation)
SELECT u.question_id, u.option_text, u.is_correct, u.explanation
FROM quiz_option_updates u
WHERE NOT EXISTS (
  SELECT 1
  FROM (
    SELECT
      o.question_id,
      ROW_NUMBER() OVER (PARTITION BY o.question_id ORDER BY o.id ASC) AS position
    FROM quiz_options o
    WHERE o.question_id = u.question_id
  ) ranked
  WHERE ranked.position = u.position
);

-- Opcoes extras antigas deixam de ser gabarito, mas permanecem para nao quebrar historico.
WITH ranked AS (
  SELECT
    o.id,
    ROW_NUMBER() OVER (PARTITION BY o.question_id ORDER BY o.id ASC) AS position
  FROM quiz_options o
  WHERE o.question_id IN (SELECT question_id FROM quiz_question_updates)
)
UPDATE quiz_options o
SET is_correct = FALSE
FROM ranked r
WHERE o.id = r.id
  AND r.position > 4;

SELECT setval(
  pg_get_serial_sequence('quiz_questions', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM quiz_questions), 12),
  true
);

SELECT setval(
  pg_get_serial_sequence('quiz_options', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM quiz_options), 1),
  true
);

DROP TABLE IF EXISTS quiz_option_updates;
DROP TABLE IF EXISTS quiz_question_updates;
