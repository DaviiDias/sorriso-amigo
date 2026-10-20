-- ATENCAO: este seed e destrutivo (TRUNCATE ... CASCADE) e so deve ser usado em base FRESH.
-- Em base existente, usar server/sql/migrations/002_update_quiz_content.sql. Nao execute este arquivo em producao/historico.
-- Limpar dados antigos para garantir inserção limpa e sem conflitos
TRUNCATE TABLE guide_steps, quiz_options, quiz_questions, educational_videos CASCADE;

-- Inserir Etapas do Guia Lúdico (exatamente conforme o mock)
INSERT INTO guide_steps (step_order, title, description, image_url)
VALUES
  (1, 'Preparar a escova', 'Separe escova macia e copo com agua para iniciar de forma previsivel.', './assets/illustrations/guide-1.svg'),
  (2, 'Molhar a escova', 'Molhe levemente a escova para reduzir incomodo sensorial.', './assets/illustrations/guide-2.svg'),
  (3, 'Aplicar pasta dental', 'Use quantidade pequena (grao de ervilha).', './assets/illustrations/guide-3.svg'),
  (4, 'Escovar com ritmo', 'Movimentos suaves por cerca de 2 minutos.', './assets/illustrations/guide-4.svg'),
  (5, 'Finalizar e elogiar', 'Finalize com reforco positivo para manter a rotina.', './assets/illustrations/guide-5.svg');

-- Inserir Perguntas do Quiz (corpus F05; seed.sql e destrutivo e so deve rodar em base fresh)
INSERT INTO quiz_questions (id, question_text, category, image_url)
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

-- Sincronizar a sequência do ID da tabela de perguntas para não causar problemas em inserções futuras
SELECT setval('quiz_questions_id_seq', (SELECT MAX(id) FROM quiz_questions));

-- Inserir Opções do Quiz
INSERT INTO quiz_options (question_id, option_text, is_correct, explanation)
VALUES
  (1, 'Uma doença contagiosa', false, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
  (1, 'Um transtorno do neurodesenvolvimento', true, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
  (1, 'Uma doença exclusivamente genética', false, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
  (1, 'Uma deficiência sensorial isolada', false, 'O TEA caracteriza-se como um transtorno do neurodesenvolvimento, marcado por alterações na comunicação, interação social e comportamentos repetitivos.'),
  (2, 'Uma vez ao dia, preferencialmente à noite', false, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
  (2, 'Duas vezes ao dia, de manhã e à noite', false, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
  (2, 'Três vezes ao dia, após as principais refeições', true, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
  (2, 'Apenas quando houver solicitação da criança', false, 'Escovar os dentes após as principais refeições (café da manhã, almoço e jantar) ajuda a remover restos de alimentos e o biofilme dental, contribuindo para prevenir a cárie.'),
  (3, 'Cerdas duras e cabeça grande', false, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
  (3, 'Cerdas médias e cabeça grande', false, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
  (3, 'Cerdas macias e cabeça pequena', true, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
  (3, 'Qualquer escova apresenta a mesma eficácia', false, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
  (4, 'Sim', true, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
  (4, 'Não', false, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
  (4, 'Apenas para adultos', false, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
  (4, 'Apenas para crianças', false, 'O flúor desempenha papel na prevenção da cárie dentária, promovendo remineralização do esmalte dentário. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
  (5, 'Alimentos naturais e minimamente processados', false, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
  (5, 'Frutas fibrosas', false, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
  (5, 'Alimentos açucarados e ultraprocessados', true, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
  (5, 'Laticínios', false, 'Alimentos ricos em açúcares são metabolizados por bactérias do biofilmes, produzindo ácidos que reduzem o pH bucal e causam desmineralização do esmalte dentário. Quando consumidos com frequência, aumentam o risco de cárie dentária.'),
  (6, 'Fortalecimento dentário', false, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
  (6, 'Desenvolvimento de cárie dentária', true, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
  (6, 'Crescimento dentário', false, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
  (6, 'Clareamento natural dos dentes', false, 'O açúcar é metabolizado por bactérias do biofilme dental, resultando na produção de ácidos que desmineralizam o esmalte, levando à formação de lesões de cárie.'),
  (7, 'Suspender a escovação', false, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
  (7, 'Realizar a escovação de forma forçada', false, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
  (7, 'Introduzir a escovação gradualmente com reforço positivo', true, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
  (7, 'Reduzir a frequência da escovação', false, 'A abordagem gradual, associada ao reforço positivo, promove adaptação progressiva e construção de associações positivas com a higiene bucal.'),
  (8, 'Ausência de reforço', false, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
  (8, 'Oferta de alimentos açucarados', false, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
  (8, 'Reforço positivo imediato, com elogios ou atividades prazerosas', true, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
  (8, 'Redução da frequência de escovação', false, 'O reforço positivo imediato pode incentivar a repetição da escovação. Evite alimentos açucarados como recompensa, impacta negativamente na saúde bucal.'),
  (9, 'Esfoliação dentária fisiológica', false, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
  (9, 'Irritabilidade associada a comportamentos repetitivos na face', true, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
  (9, 'Preferência alimentar habitual', false, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
  (9, 'Manchas iniciais no esmalte', false, 'Mudanças comportamentais, como irritabilidade, recusa alimentar e toques excessivos na face, podem indicar dor. O reconhecimento precoce desses sinais é fundamental para intervenção e procura do cirurgião-dentista.'),
  (10, 'Apenas em situações de dor', false, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
  (10, 'Anualmente', false, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
  (10, 'A cada seis meses', true, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
  (10, 'Desnecessária com boa higiene', false, 'Consultas semestrais permitem monitoramento contínuo, prevenção de possíveis desordens orais e adaptação progressiva do paciente ao ambiente odontológico, reduzindo ansiedade e intervenções invasivas.'),
  (11, 'Impor a escovação', false, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
  (11, 'Uso de recursos visuais e educativos', true, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
  (11, 'Realização da escovação quando a criança pedir', false, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
  (11, 'Suspensão em dias de resistência', false, 'Recursos visuais e ilustrativos auxiliam na compreensão da atividade, reduzindo a ansiedade e aumentando a cooperação.'),
  (12, 'Escovar os dentes três vezes ao dia', false, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.'),
  (12, 'Consumo frequente de bebidas ácidas, como sucos industrializados', true, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.'),
  (12, 'Mastigar alimentos fibrosos, como frutas', false, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.'),
  (12, 'Uso regular de flúor', false, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte dentário, podendo causar erosão. Reconhecer esse risco ajuda a prevenir problemas dentários.');


-- Inserir Vídeos Educativos (exatamente conforme o mock, com URLs únicas para satisfazer a constraint)
INSERT INTO educational_videos (title, description, url, audience)
VALUES
  ('Escovacao adaptada para TEA', 'Tecnicas de abordagem gradual para rotina de higiene oral.', 'https://www.youtube.com/watch?v=JYgM9sGQqDY&v=1', 'all'),
  ('Manejo de resistencia', 'Estrategias de comunicacao e reforco positivo no dia a dia.', 'https://www.youtube.com/watch?v=2f8A3f6wE8Q&v=2', 'all'),
  ('Prevencao em saude bucal', 'Conteudo para familias e profissionais de apoio.', 'https://www.youtube.com/watch?v=4N8R4h3rBlM&v=3', 'all'),
  ('Rotina visual passo a passo', 'Como usar imagens e sequencias para preparar a escovacao.', 'https://www.youtube.com/watch?v=JYgM9sGQqDY&v=4', 'all'),
  ('Fio dental com paciencia', 'Dicas para introduzir o fio dental sem aumentar a ansiedade.', 'https://www.youtube.com/watch?v=2f8A3f6wE8Q&v=5', 'all'),
  ('Alimentacao e dentes saudaveis', 'Habitos alimentares que ajudam na prevencao de caries.', 'https://www.youtube.com/watch?v=4N8R4h3rBlM&v=6', 'all'),
  ('Primeira ida ao dentista', 'O que esperar e como preparar a crianca para a consulta.', 'https://www.youtube.com/watch?v=JYgM9sGQqDY&v=7', 'all'),
  ('Reforco positivo na higiene oral', 'Elogios e recompensas que fortalecem a adesao a rotina.', 'https://www.youtube.com/watch?v=2f8A3f6wE8Q&v=8', 'all'),
  ('Historia social: hora de escovar', 'Narrativa lúdica para antecipar o momento da escovacao.', 'https://www.youtube.com/watch?v=4N8R4h3rBlM&v=9', 'all');
