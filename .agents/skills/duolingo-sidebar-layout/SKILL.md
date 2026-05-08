---
name: duolingo-sidebar-layout
description: Skill to generate a Duolingo-style minimalist sidebar layout for the Sorriso Amigo app using Vanilla HTML, CSS, and JS.
---

# Sorriso Amigo - Sidebar Layout Architecture

## 1. CONTEXTO DO SISTEMA (SORRISO AMIGO)
O sistema "Sorriso Amigo" é uma plataforma web educacional para acompanhamento de saúde bucal voltada para pessoas com Transtorno do Espectro Autista (TEA), cuidadores e profissionais.
O sistema já possui funcionalidades implementadas (Dashboard, Checklist, Guia lúdico, Quiz, Vídeos e Configurações).
A estrutura tecnológica base requerida pelo usuário é **Vanilla HTML, CSS e JavaScript**.

## 2. OBJETIVO DA SKILL
O objetivo principal é reconstruir a **estrutura de layout e a Navbar (Sidebar Lateral)** da aplicação, servindo como a fundação visual (o esqueleto) para onde os conteúdos atuais serão migrados depois.
Neste primeiro momento, o foco é a barra lateral e a casca do app. O conteúdo principal fica como um container a ser preenchido.

## 3. DIRETRIZES DE DESIGN (ESTILO DUOLINGO / MINIMALISTA)
O design deve seguir estritamente o estilo visual da plataforma Duolingo:
*   **Minimalismo e Respiro:** Interface limpa, cantos arredondados, margens e paddings generosos.
*   **Layout Base:** Sidebar fixa na lateral esquerda e uma área ampla para o conteúdo à direita.
*   **Cores e Contraste:** Utilizar um tema escuro confortável (ex: fundos como `#131f24`, cards `#202f36`) ou o que o usuário preferir, mas garantindo contraste amigável e limpo.
*   **Formas:** Arredondamento pronunciado (`border-radius: 12px` ou `16px`).
*   **Micro-interações:** Botões com estados `:hover` e `:active` muito bem definidos. Efeito de botão "físico" que afunda ao clicar.

## 4. ESTRUTURA DA SIDEBAR (MENU LATERAL)
A barra lateral deve ser construída na exata ordem abaixo. Cada item requer um ícone amigável e legível:
1.  **Dashboard**
2.  **Checklist**
3.  **Guia**
4.  **Quizz**
5.  **Video**
6.  **Configurações**
7.  **Sair** *(Este item deve receber cor avermelhada/alerta, indicando ação de saída, conforme desenhado pelo usuário).*

## 5. REGRAS TÉCNICAS E CSS
*   **Stack:** Apenas **HTML, CSS e JavaScript**. Sem Tailwind, sem Bootstrap.
*   **Variáveis:** Use o `:root` para centralizar as cores e espaçamentos (ex: `--bg-dark`, `--sidebar-bg`, `--accent-color`).
*   **Layout:** Estruture o wrapper principal usando `display: grid; grid-template-columns: 250px 1fr;` (ou flexbox) para que a barra ocupe a lateral no desktop.
*   **Responsividade:** No mobile (`@media (max-width: 768px)`), a Sidebar deve se transformar em uma **Bottom Navigation Bar** (barra inferior) mostrando apenas os ícones, exatamente como o app mobile do Duolingo.
*   **Interatividade:** O item de menu selecionado (Ativo) deve ter grande destaque visual (ex: ícone colorido e fundo claro transparente) comparado aos itens inativos.
*   **Acessibilidade:** Pense no público TEA (Transtorno do Espectro Autista): garanta alto contraste, fontes grandes e legíveis (Nunito, Baloo 2), sem animações frenéticas.

## 6. INSTRUÇÃO DE EXECUÇÃO
Ao acionar esta skill, gere os arquivos `index.html`, `style.css` e `script.js` contemplando a Sidebar. 
A área de conteúdo principal deve ter apenas uma marcação (ex: `<main id="content"><h2>Dashboard</h2></main>`) para demonstrar o layout. Não reescreva todo o sistema existente agora, foque APENAS em entregar a melhor Sidebar inspirada no Duolingo.
