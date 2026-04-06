INSERT INTO guide_steps (step_order, title, description, image_url)
VALUES
  (1, 'Preparar a escova', 'Pegue uma escova de cerdas macias e um copo com agua. Mostre de forma calma para reduzir ansiedade.', 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=800&q=80'),
  (2, 'Molhar a escova', 'Molhe levemente a escova para facilitar o deslizamento e evitar incomodo sensorial.', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80'),
  (3, 'Aplicar pasta dental', 'Use pequena quantidade de pasta (aprox. um grao de ervilha).', 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80'),
  (4, 'Escovar com ritmo', 'Escove com movimentos suaves por aproximadamente 2 minutos. Divida por quadrantes da boca.', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'),
  (5, 'Finalizar e elogiar', 'Enxague, limpe a boca e ofereca reforco positivo com elogio e rotina previsivel.', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (step_order) DO NOTHING;

INSERT INTO quiz_questions (question_text, category)
VALUES
  ('Qual horario e mais importante para escovar os dentes?', 'Escovacao'),
  ('Qual atitude ajuda quando ha resistencia durante a escovacao?', 'Comportamento'),
  ('Qual alimento aumenta o risco de carie quando consumido com frequencia?', 'Alimentacao'),
  ('Com que frequencia a consulta odontologica preventiva e recomendada?', 'Consulta odontologica'),
  ('Qual estrategia visual pode ajudar pessoas com TEA na higiene oral?', 'Manejo comportamental')
ON CONFLICT (question_text) DO NOTHING;

INSERT INTO quiz_options (question_id, option_text, is_correct, explanation)
VALUES
  (1, 'Apenas de manha', false, 'Idealmente a escovacao deve ocorrer 2 a 3 vezes ao dia, incluindo a noite.'),
  (1, 'Apos as principais refeicoes e antes de dormir', true, 'Excelente: apos refeicoes e antes de dormir reduz placa bacteriana e risco de carie.'),
  (1, 'Somente antes da consulta no dentista', false, 'A higiene deve ser diaria e frequente, nao eventual.'),

  (2, 'Forcar rapidamente para terminar logo', false, 'Forcar pode aumentar ansiedade e associar a escovacao a experiencia negativa.'),
  (2, 'Criar rotina previsivel e usar reforco positivo', true, 'Rotina estruturada e reforco positivo ajudam a reduzir resistencia e ampliar adesao.'),
  (2, 'Evitar escovar nos dias de resistencia', false, 'Pular a rotina aumenta risco de problemas bucais.'),

  (3, 'Frutas in natura', false, 'Frutas in natura sao importantes para saude geral e bucal quando consumidas adequadamente.'),
  (3, 'Doces pegajosos e refrigerantes', true, 'Acucar frequente e alimentos pegajosos elevam risco de carie.'),
  (3, 'Agua', false, 'Agua ajuda na hidratacao e limpeza bucal.'),

  (4, 'Somente quando sente dor', false, 'A consulta preventiva evita agravamentos e identifica problemas cedo.'),
  (4, 'A cada 6 meses, ou conforme orientacao profissional', true, 'Avaliacao periodica favorece prevencao e acompanhamento adequado.'),
  (4, 'Uma vez por ano, no maximo', false, 'Para muitos casos, acompanhamento semestral e o mais indicado.'),

  (5, 'Checklist visual e guia passo a passo com imagens', true, 'Recursos visuais estruturam expectativas e facilitam a autonomia.'),
  (5, 'Apenas instrucoes verbais longas', false, 'Explicacoes longas e sem apoio visual podem ser menos efetivas.'),
  (5, 'Retirar toda rotina para evitar frustracao', false, 'A previsibilidade da rotina costuma ser benefica para TEA.')
ON CONFLICT (question_id, option_text) DO NOTHING;

INSERT INTO educational_videos (title, description, url, audience)
VALUES
  ('Escovacao adaptada para TEA', 'Tecnicas de abordagem gradual e previsivel para higiene oral.', 'https://www.youtube.com/watch?v=JYgM9sGQqDY', 'caregivers'),
  ('Manejo de resistencia durante a rotina', 'Estrategias de comunicacao e reforco positivo.', 'https://www.youtube.com/watch?v=2f8A3f6wE8Q', 'caregivers'),
  ('Saude bucal infantil e prevencao', 'Conteudo educativo para familias e profissionais.', 'https://www.youtube.com/watch?v=4N8R4h3rBlM', 'all')
ON CONFLICT (url) DO NOTHING;
