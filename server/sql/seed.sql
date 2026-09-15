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

-- Inserir Perguntas do Quiz
INSERT INTO quiz_questions (id, question_text, category, image_url)
VALUES
  (1, 'O Transtorno do Espectro Autista (TEA) é definido como:', 'Compreensão do TEA', './assets/illustrations/dentist-quiz.svg'),
  (2, 'A frequência da escovação dentária é um fator determinante na prevenção de desordens na cavidade oral. Qual é a recomendação mais adequada?', 'Higiene Bucal', './assets/illustrations/dentist-quiz.svg'),
  (3, 'Considerando a hipersensibilidade sensorial frequentemente observada em indivíduos com TEA, qual é o tipo de escova dental mais indicado?', 'Higiene Bucal', './assets/illustrations/dentist-quiz.svg'),
  (4, 'A pasta de dente deve conter flúor?', 'Higiene Bucal', './assets/illustrations/dentist-quiz.svg'),
  (5, 'A dieta influencia diretamente a saúde bucal. Qual dos seguintes grupos alimentares apresenta maior risco cariogênico quando consumido com frequência?', 'Alimentação e Saúde Bucal', './assets/illustrations/dentist-quiz.svg'),
  (6, 'O que pode causar com o consumo frequente de açúcar na cavidade oral?', 'Alimentação e Saúde Bucal', './assets/illustrations/dentist-quiz.svg'),
  (7, 'Diante da resistência à escovação em indivíduos com TEA, qual conduta é mais indicada?', 'Manejo Comportamental no TEA', './assets/illustrations/dentist-quiz.svg'),
  (8, 'Qual é a forma mais adequada de reforço após a escovação?', 'Manejo Comportamental no TEA', './assets/illustrations/dentist-quiz.svg'),
  (9, 'Em indivíduos com TEA não verbais, qual sinal pode indicar dor odontológica?', 'Manejo Comportamental no TEA', './assets/illustrations/dentist-quiz.svg'),
  (10, 'Qual é a periodicidade recomendada de consultas odontológicas preventivas para indivíduos com TEA?', 'Atenção Odontológica Preventiva', './assets/illustrations/dentist-quiz.svg'),
  (11, 'Qual estratégia favorece a cooperação durante a higiene bucal em indivíduos com TEA?', 'Atenção Odontológica Preventiva', './assets/illustrations/dentist-quiz.svg'),
  (12, 'Qual hábito pode causar desgaste no dente (erosão) em crianças com TEA?', 'Erosão dentária', './assets/illustrations/dentist-quiz.svg');

-- Sincronizar a sequência do ID da tabela de perguntas para não causar problemas em inserções futuras
SELECT setval('quiz_questions_id_seq', (SELECT MAX(id) FROM quiz_questions));

-- Inserir Opções do Quiz
INSERT INTO quiz_options (question_id, option_text, is_correct, explanation)
VALUES
  (1, 'Uma doença contagiosa', false, 'O TEA é um transtorno do neurodesenvolvimento, marcado por alterações na comunicação social, padrões comportamentais repetitivos e possíveis alterações sensoriais.'),
  (1, 'Um transtorno do neurodesenvolvimento', true, 'O TEA é um transtorno do neurodesenvolvimento, marcado por alterações na comunicação social, padrões comportamentais repetitivos e possíveis alterações sensoriais.'),
  (1, 'Uma doença exclusivamente genética', false, 'O TEA não é definido como uma doença exclusivamente genética.'),
  (1, 'Uma deficiência sensorial isolada', false, 'O TEA envolve características do neurodesenvolvimento, não apenas alterações sensoriais.'),
  (2, 'Uma vez ao dia, preferencialmente à noite', false, 'A escovação deve acontecer ao longo do dia, após as principais refeições.'),
  (2, 'Duas vezes ao dia: manhã e noite', false, 'A recomendação mais adequada é realizar a escovação após as principais refeições.'),
  (2, 'Três vezes ao dia, após as refeições principais', true, 'A escovação deve ser realizada após as principais refeições, sendo a escovação noturna a mais importante por causa da redução do fluxo salivar durante o sono.'),
  (2, 'Apenas quando houver solicitação da criança', false, 'A higiene bucal deve fazer parte de uma rotina diária previsível.'),
  (3, 'Cerdas duras e cabeça grande', false, 'Cerdas macias e cabeça pequena tendem a ser mais bem toleradas.'),
  (3, 'Cerdas médias e cabeça grande', false, 'Cerdas macias e cabeça pequena proporcionam menor estímulo tátil.'),
  (3, 'Cerdas macias e cabeça pequena', true, 'Escovas com cerdas macias e cabeça pequena proporcionam menor estímulo tátil e maior controle durante a escovação.'),
  (3, 'Qualquer escova apresenta a mesma eficácia', false, 'O tipo de escova pode influenciar a tolerância sensorial.'),
  (4, 'Sim', true, 'O flúor promove a remineralização do esmalte e reduz a atividade bacteriana. Seu uso é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
  (4, 'Não', false, 'O flúor tem papel essencial na prevenção da cárie dentária.'),
  (4, 'Apenas para adultos', false, 'O uso do flúor é recomendado para todas as faixas etárias, respeitando a quantidade adequada.'),
  (4, 'Somente quando o dentista manda', false, 'A pasta de dente fluoretada é recomendada respeitando a quantidade adequada.'),
  (5, 'Alimentos naturais e minimamente processados', false, 'Alimentos açucarados e ultraprocessados apresentam maior risco cariogênico quando consumidos com frequência.'),
  (5, 'Frutas fibrosas', false, 'Alimentos açucarados e ultraprocessados apresentam maior risco cariogênico.'),
  (5, 'Alimentos açucarados e ultraprocessados', true, 'Açúcares são metabolizados por bactérias do biofilme, produzindo ácidos que desmineralizam o esmalte.'),
  (5, 'Laticínios', false, 'O maior risco cariogênico está relacionado ao consumo frequente de açúcares.'),
  (6, 'Fortalecimento dentário', false, 'O açúcar pode favorecer a desmineralização do esmalte.'),
  (6, 'Desenvolvimento de cárie dentária', true, 'O açúcar é metabolizado por bactérias do biofilme dental, produzindo ácidos que desmineralizam o esmalte e levam à formação de lesões de cárie.'),
  (6, 'Crescimento dentário acelerado', false, 'O consumo frequente de açúcar não acelera o crescimento dentário.'),
  (6, 'Clareamento dental natural', false, 'O açúcar não promove clareamento dental.'),
  (7, 'Suspender a escovação', false, 'A higiene bucal deve ser mantida com uma abordagem gradual e acolhedora.'),
  (7, 'Realizar a escovação de forma forçada', false, 'Forçar pode aumentar a resistência e gerar associações negativas.'),
  (7, 'Introduzir gradualmente com reforço positivo', true, 'A abordagem gradual associada ao reforço positivo promove adaptação progressiva e associações positivas com a higiene bucal.'),
  (7, 'Reduzir a frequência da escovação', false, 'A frequência não deve ser reduzida; a estratégia deve ser adaptada.'),
  (8, 'Ausência de reforço', false, 'O reforço positivo imediato fortalece a repetição do comportamento desejado.'),
  (8, 'Oferta de alimentos açucarados', false, 'Recompensas não alimentares são preferíveis para proteger a saúde bucal.'),
  (8, 'Reforço positivo imediato (elogios ou atividades prazerosas)', true, 'O reforço positivo imediato fortalece a probabilidade de repetição do comportamento desejado.'),
  (8, 'Redução da frequência de escovação', false, 'Reduzir a frequência não é uma forma adequada de reforço.'),
  (9, 'Esfoliação dentária fisiológica', false, 'Mudanças comportamentais podem indicar dor odontológica.'),
  (9, 'Irritabilidade associada a comportamentos repetitivos na face', true, 'Irritabilidade, recusa alimentar e toques excessivos na face podem indicar dor odontológica.'),
  (9, 'Preferência alimentar habitual', false, 'Mudanças comportamentais e recusa alimentar podem indicar dor.'),
  (9, 'Manchas iniciais no esmalte', false, 'Sinais comportamentais também devem ser observados em indivíduos não verbais.'),
  (10, 'Apenas em situações de dor', false, 'Consultas preventivas devem ocorrer regularmente, e não apenas em situações de dor.'),
  (10, 'Anualmente', false, 'A recomendação apresentada é de consultas preventivas a cada seis meses.'),
  (10, 'A cada seis meses', true, 'Consultas semestrais permitem monitoramento contínuo, prevenção e adaptação progressiva ao ambiente odontológico.'),
  (10, 'Desnecessária com boa higiene', false, 'Mesmo com boa higiene, o acompanhamento preventivo continua importante.'),
  (11, 'Imposição da escovação', false, 'A imposição pode aumentar a resistência e a ansiedade.'),
  (11, 'Uso de recursos visuais e educativos', true, 'Recursos visuais auxiliam na previsibilidade e compreensão da atividade, reduzindo ansiedade e aumentando a cooperação.'),
  (11, 'Realização apenas quando a criança pedir', false, 'A higiene bucal deve fazer parte de uma rotina previsível.'),
  (11, 'Suspensão em dias de resistência', false, 'A estratégia deve ser adaptada, sem abandonar a rotina de higiene.'),
  (12, 'Escovar os dentes três vezes ao dia', false, 'A escovação adequada não é o hábito descrito como causa de erosão.'),
  (12, 'Consumo frequente de bebidas ácidas, como sucos industrializados', true, 'Bebidas ácidas diminuem o pH bucal e desgastam o esmalte, podendo causar erosão.'),
  (12, 'Mastigar alimentos fibrosos, como frutas', false, 'O hábito descrito como risco de erosão é o consumo frequente de bebidas ácidas.'),
  (12, 'Uso regular de flúor', false, 'O flúor contribui para a prevenção da cárie dentária.');

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
