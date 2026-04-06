# Checklist de Requisitos da Entrega

## 1. Funcionalidades da aplicacao

- [x] Tela inicial com login e cadastro.
- [x] Menu principal com Dashboard, Checklist, Guia, Quiz, Videos e Configuracoes.
- [x] Checklist diario com periodo de escovacao, nivel de resistencia e observacoes.
- [x] Guia ludico de escovacao com passo a passo e imagens.
- [x] Quiz educativo com feedback imediato e historico.
- [x] Videos educativos.
- [x] Configuracoes, ajuda, termos de uso e acessibilidade.
- [x] Modo demonstracao temporario para visualizacao sem backend.

## 2. Banco de dados e persistencia

- [x] Banco relacional PostgreSQL criado.
- [x] Usuarios gravados com senha criptografada.
- [x] Checklist gravado com leitura por periodo.
- [x] Estatisticas do dashboard calculadas a partir dos registros.
- [x] Quiz com registro de tentativas e respostas.
- [x] Preferencias do usuario salvas no banco.
- [x] Conteudos de guia e videos carregados via API e banco.

## 3. Seguranca e acesso

- [x] Autenticacao com JWT.
- [x] Protecao de rotas com validacao de token.
- [x] Consentimento de uso no cadastro.
- [x] Uso de variaveis de ambiente para secrets e conexao com banco.

## 4. Deploy e publicacao

- [x] Repositorio GitHub criado.
- [x] Tags de versao criadas.
- [x] Aplicacao publicada no Render.
- [x] Dockerfile configurado na raiz para build no Render.
- [x] Variaveis de ambiente configuradas no Web Service.
- [x] Banco PostgreSQL configurado no Render.

## 5. Validacao tecnica

- [x] Sintaxe do frontend e backend validada.
- [x] Endpoint de health check validado.
- [x] Configuracao do Docker Compose validada.
- [ ] Validacao integrada completa de leitura e gravacao no banco local pendente de ambiente com banco ativo.

## 6. Controle de versao e documentacao

- [x] Codigo-fonte versionado em Git.
- [x] Repositorio remoto publicado no GitHub.
- [x] Tag de entrega principal criada.
- [x] Guia do usuario criado.
- [x] Documento de controle de versao criado.
- [x] Documento de validacao tecnica criado.

## 7. Conclusao

A entrega atende os requisitos principais do escopo e ja possui publicacao web, documentacao de usuario, controle de versao e estrutura de persistencia em banco relacional. O unico ponto ainda dependente de teste local adicional e a validacao integrada completa com banco ativo neste ambiente.
