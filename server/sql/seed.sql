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

-- Inserir Perguntas do Quiz (exatamente conforme o mock)
INSERT INTO quiz_questions (id, question_text, category)
VALUES
  (1, 'Qual horario e mais importante para escovar os dentes?', 'Escovacao'),
  (2, 'Qual atitude ajuda quando ha resistencia durante a escovacao?', 'Comportamento'),
  (3, 'Qual recurso visual ajuda pessoas com TEA na higiene oral?', 'Manejo comportamental');

-- Sincronizar a sequência do ID da tabela de perguntas para não causar problemas em inserções futuras
SELECT setval('quiz_questions_id_seq', (SELECT MAX(id) FROM quiz_questions));

-- Inserir Opções do Quiz (exatamente conforme o mock)
INSERT INTO quiz_options (question_id, option_text, is_correct, explanation)
VALUES
  -- Pergunta 1
  (1, 'Apenas de manha', false, 'A escovacao no periodo da manha e importante, mas nao e a unica necessaria.'),
  (1, 'Apos as principais refeicoes e antes de dormir', true, 'Excelente: a frequencia ao longo do dia melhora a prevencao.'),
  (1, 'Somente no dia da consulta', false, 'A escovacao deve ser um habito diario constante e regular.'),

  -- Pergunta 2
  (2, 'Forcar para terminar rapido', false, 'Forcar a escovacao pode gerar traumas e aumentar a resistencia da crianca.'),
  (2, 'Criar rotina previsivel e reforco positivo', true, 'Rotina e reforco positivo melhoram adesao e reduzem ansiedade.'),
  (2, 'Pular os dias de resistencia', false, 'Pular a higiene bucal favorece o acumulo de placa e o surgimento de caries.'),

  -- Pergunta 3
  (3, 'Checklist visual com passo a passo', true, 'Imagens e passos claros ajudam previsibilidade e autonomia.'),
  (3, 'Somente explicacao verbal longa', false, 'Instrucoes orais complexas podem ser dificeis de processar sensorialmente.'),
  (3, 'Sem rotina definida', false, 'A falta de previsibilidade e rotina pode elevar a ansiedade.');

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
