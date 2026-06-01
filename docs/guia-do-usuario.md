# Guia do Usuario - Sorriso Amigo

Este guia mostra como acessar o sistema e usar cada funcionalidade da plataforma.

## 1. Como acessar a aplicacao

### Opcao A - Acesso rapido para demonstracao (sem backend)

1. Abra o arquivo `code/index.html` no navegador.
2. Na tela inicial, clique em **Entrar na plataforma**.
3. O sistema abre em modo demonstracao, com dados de exemplo.

### Opcao B - Ambiente completo (frontend + API + banco)

1. Configure o backend com base em `server/.env.example`.
2. Suba os servicos (`docker compose up --build`) ou rode backend e PostgreSQL manualmente.
3. Acesse `https://sorriso-amigo.onrender.com/`.
4. Cadastre-se ou realize login.

## 2. Tela inicial (Acesso)

### Entrar

- Preencha e-mail e senha.
- Clique em **Entrar na plataforma**.

### Criar conta

- Clique em **Criar conta**.
- Informe nome, e-mail, perfil e senha.
- Marque aceite de termos.
- Clique em **Criar conta e iniciar**.

## 3. Dashboard

Ao entrar, o Dashboard exibe:

- **Adesao mensal**: percentual de escovacoes concluidas no mes.
- **Escovacoes concluidas**: total no periodo.
- **Resistencia moderada/grave**: quantidade de registros mais criticos.
- **Historico recente**: tabela dos ultimos dias.

Como usar:

1. Ajuste o campo **Mes de referencia**.
2. Veja os indicadores atualizados automaticamente.

## 4. Checklist diario

Objetivo: registrar a rotina diaria de higiene bucal.

Como usar:

1. Abra a aba **Checklist**.
2. Selecione a **Data**.
3. Marque os periodos escovados (manha/tarde/noite).
4. Selecione o **Nivel de resistencia**.
5. Preencha observacoes, se necessario.
6. Clique em **Salvar registro**.

Resultado:

- O registro passa a contar no dashboard e no historico.

## 5. Guia ludico de escovacao

Objetivo: orientar o passo a passo visual.

Como usar:

1. Abra a aba **Guia**.
2. Consulte as etapas na ordem apresentada.
3. Use as imagens e textos como apoio durante a rotina.

## 6. Quiz educativo

Objetivo: reforcar aprendizado de cuidadores/familiares/profissionais.

Como usar:

1. Abra a aba **Quiz**.
2. Responda todas as perguntas.
3. Clique em **Enviar respostas**.
4. Veja pontuacao e feedback por pergunta.
5. Consulte o bloco **Ultimas tentativas** para historico.

## 7. Videos educativos

Objetivo: oferecer conteudo complementar de educacao e manejo.

Como usar:

1. Abra a aba **Videos**.
2. Clique nos players para assistir os conteudos.

## 8. Configuracoes

### Lembretes

1. Ative **Ativar lembretes de escovacao no navegador**.
2. Informe horarios no formato `HH:MM` separados por virgula.
3. Salve as preferencias.

### Acessibilidade

- **Padrao**
- **Alto contraste**
- **Texto ampliado**

Selecione o modo e salve.

### Ajuda e Termos

- Consulte contatos sugeridos.
- Leia o texto resumido de uso e consentimento.

## 9. Solucao de problemas

### So aparece a tela de login

- Em demonstracao: basta clicar em **Entrar na plataforma**.
- Em ambiente completo: confirme se backend e banco estao ativos.

### Erro de conexao com API

- Verifique variaveis de ambiente no backend.
- Confirme se a API responde em `/api/health`.

### Lembretes nao aparecem

- Conceda permissao de notificacao no navegador.
- Revise formato dos horarios (`HH:MM`).

## 10. Versao da entrega

- Repositorio GitHub: `https://github.com/DaviiDias/sorriso-amigo`
- Branch principal entregue: `master`
- Commit da entrega inicial: `31d66d7e578f7d6b3ae0c7f512cee1a7e58a7b15`
- Tag da entrega inicial: `v1.0.0-entrega`
- Commit com governanca e validacao: `c881945602bf4f5ee1fa9120f5fc86dfad5ad118`
- Tag com governanca: `v1.0.1-entrega-com-governanca`
- Commit de ajuste para deploy no Render: `b3b9311c0a8e08975a2057ab661a82f270b34f5c`

## 11. Requisitos atendidos

- Acesso inicial com tela de login e cadastro: atendido.
- Menu principal com Dashboard, Checklist, Guia, Quiz, Videos e Configuracoes: atendido.
- Checklist diario com horario e nivel de resistencia: atendido.
- Guia ludico passo a passo com imagens: atendido.
- Quiz com feedback e historico: atendido.
- Videos educativos: atendido.
- Configuracoes, ajuda, termos e acessibilidade: atendido.
- Banco relacional com leitura e gravacao pelos endpoints: implementado.
- Deploy em servidor real (Render): configurado e publicado.
- Modo demonstracao sem backend para visualizacao: disponivel temporariamente.
