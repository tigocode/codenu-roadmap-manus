@AGENTS.md

# 🧠 AI Context & Rules: Codenu Roadmap (Front-end)

## 🎯 1. Visão Geral do Projeto
* **O que é:** Interface web (Front-end) do ecossistema de roadmap da codenu.
* **Público-Alvo:** Equipe de desenvolvimento, CEO, Marketing, Vendas e stakeholders.
* **Fase Atual:** Setup inicial e construção da arquitetura base (MVP).

## 🛠️ 2. Tech Stack
* **Framework:** React - Next.js (App Router - pasta `src/app`).
* **Linguagem:** TypeScript estrito.
* **Estilização:** Tailwind CSS.
* **Comunicação com a API:** Axios para requisições HTTP, sempre com tipagem estrita das respostas.
* **Testes:** Jest e React Testing Library.

## 🏛️ 3. Arquitetura e Padrões (Next.js App Router com src/)
* **Server vs Client Components:** Por padrão, a IA deve criar componentes como **Server Components** para máxima performance. Use a diretiva `"use client"` estritamente e apenas quando houver necessidade de interatividade (hooks como `useState`, `useEffect` ou eventos de clique).
* **Estrutura de Pastas (Sempre dentro de /src):**
    * `src/app`: Apenas rotas, layouts e pages.
    * `src/components`: Componentes visuais reutilizáveis.
    * `src/types`: Interfaces e tipagens globais do TypeScript.
    * `src/services`: Funções de consumo de API (Server Actions ou chamadas externas).
    * `src/utils`: Funções auxiliares e formatações.

## 💼 4. Regras de Negócio Core (Desenvolvimento Orientado a Contratos)
*(Atenção IA: Como o back-end pode estar em desenvolvimento paralelo, siga estas regras para o front-end)*
* **Regra 1 (Mocks First):** Ao criar uma nova funcionalidade que manipule ideias ou dados de utilizadores, crie primeiro a Interface TypeScript/Objeto (o contrato) antes de mexer na UI. A consistência dos metadados (esforço, impacto, projeto, responsável) é vital.
* **Regra 2 ("Inbox para Workflow"):** * Todas as novas ideias inseridas via Quick Capture (Barra Superior) devem obrigatoriamente ir para a Inbox num estado "cru" (apenas título).
    * A UI detalhada (tags, esforço, impacto, avatares) só deve ser exigida ou exibida quando a ideia transitar para as colunas do Roadmap (Agora, A Seguir, Mais Tarde).
* **Regra 3 (Semântica Visual de Colunas e Áreas):** Para manter o reconhecimento imediato, as cores não devem ser alteradas arbitrariamente:
    * 🟢 Agora (Em desenvolvimento): Foco na cor Verde.
    * 🟡 A Seguir (Próximo Sprint): Foco na cor Amarela.
    * 🔵 Mais Tarde (Backlog): Foco na cor Azul.
    * Exceção: A Inbox deve manter-se sempre neutra (Cinza) para incentivar a triagem.
* **Regra 4 (Tratamento de Exceções Visuais - Empty States)** Nenhuma área do Canvas ou Inbox deve parecer "quebrada" se estiver vazia. Se a Inbox ou uma coluna não tiver cartões, exiba um bloco tracejado amigável com uma mensagem instrutiva (ex: "A tua Inbox está limpa" ou "Arraste uma ideia para aqui").

## 🧹 5. Clean Code & Style Guide
* **Nomenclatura:** Componentes React sempre em `PascalCase`. Funções e variáveis em `camelCase`. Nomes descritivos.
* **Tipagem Forte:** Evite o uso de `any` no TypeScript a todo custo. Tipos de retorno de funções devem ser explícitos.
* **Modularidade:** Se um componente passar de 100 linhas, avalie dividi-lo em subcomponentes menores.

## 🧪 6. Estratégia de Testes (TDD Guideline)
* A primeira etapa antes de escrever a lógica ou a renderização de um componente complexo é criar o arquivo `.test.tsx` correspondente.
* Foque em testar o comportamento do usuário (acessibilidade, cliques, renderização de estados de erro) em vez de detalhes de implementação.

## 🌐 7. Idioma e Comunicação (Regra Estrita)
* **Idioma Padrão:** Todas as nossas conversas, explicações, retornos do chat, sugestões de refatoração, explicações de mensagens de erro e mensagens de ações do modo em uso DEVEM ser estritamente em **Português do Brasil (PT-BR)**.
* **Comentários no Código:** Qualquer comentário gerado dentro dos arquivos (como `//` ou `/** */`) também deve ser escrito em Português do Brasil.
* **Nomenclatura (Código):** Manter nomes de arquivos, variáveis e funções em inglês (ex: `calculatePower`, `ReportList`), para manter o padrão da indústria, mas a explicação sobre o código será sempre em PT-BR.

## 🎨 8. Padrões de Interação e Componentização UI
(Garantindo a experiência imersiva e manutenção a longo prazo)

* **Regra 8 (Acessibilidade e Modo Escuro):** Qualquer novo componente (Botão, Cartão, Modal) deve obrigatoriamente ser construído suportando o Modo Claro e o Modo Escuro (Dark Mode) via classes utilitárias baseadas em estado (ex: isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800').
* **Regra 9 (Prevenção de Modais Bloqueantes):** O detalhamento de uma ideia (Deep Planning) deve ocorrer sempre num Side Drawer (Painel Lateral) que desliza da direita, e NUNCA num Modal ao centro do ecrã. O utilizador deve poder continuar a ver o contexto do Canvas (Roadmap) em background enquanto edita a tarefa.
* **Regra 10 (Feedback Visual de Drag & Drop):** Durante a ação de arrastar um cartão de ideia (Drag), a coluna de destino (Dropzone) deve obrigatoriamente reagir visualmente (ganhando contorno destacado ou alteração de cor de fundo) para indicar claramente ao utilizador onde o cartão pode ser largado.
