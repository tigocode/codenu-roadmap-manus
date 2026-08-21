# Análise técnica do projeto Codenu Roadmap

**Repositório analisado:** `tigocode/codenu-roadmap`  
**Branch e estado:** `main`, alinhada com `origin/main`, sem alterações locais após o clone  
**Commit mais recente:** `9ce5fec — feat: implement lifecycle stepper (9 stages), history timeline, and layout fixes`  
**Autor da análise:** Manus AI  

## 1. Síntese executiva

O projeto é uma aplicação Next.js/React em TypeScript que já possui uma base visual consistente para um roadmap de ideias: Inbox, três colunas de priorização, arrastar e soltar, captura rápida, pesquisa, filtros, detalhamento em painel lateral, checklist, responsáveis, priorização ICE, estatísticas, modo claro/escuro e uma camada inicial de sincronização com Firebase.

A conclusão principal é que o produto está em um estágio de **protótipo funcional avançado de um roadmap individual**, e ainda não em um sistema colaborativo de gerenciamento de desenvolvimento. A interface já contém elementos próximos do Trello, mas o domínio, a persistência e a identidade dos usuários ainda não sustentam trabalho em equipe de forma confiável.

> O maior risco não está na camada visual. Está no fato de que a colaboração atual é principalmente simulada: o login é mockado, a seleção de perfil é local, o workspace é fixo e a sincronização cloud não possui um modelo explícito de organização, permissões, auditoria ou conflitos.

A recomendação é evoluir em etapas, preservando a experiência atual. Primeiro deve-se estabelecer um modelo real de workspace, usuários, quadros, listas e cartões. Em seguida, implementar autenticação e autorização reais, comentários, atividade, notificações e operações robustas de drag-and-drop. Só depois vale ampliar analytics, automações e integrações.

## 2. Estado atual do repositório

| Área | Estado observado | Avaliação |
|---|---|---|
| Framework | Next.js `16.2.3`, React `19.2.4`, TypeScript | Base moderna e adequada para a evolução |
| Interface | Tailwind CSS, componentes React próprios e `lucide-react` | Boa base visual, porém com componentes grandes em alguns pontos |
| Interação | `@dnd-kit/core` e `@dnd-kit/sortable` | Drag-and-drop já iniciado; falta robustez para múltiplos cenários |
| Formulários | `react-hook-form` e `zod` | Dependências adequadas, mas login ainda não é integrado |
| Persistência local | `localStorage` | Útil para protótipo e fallback offline |
| Persistência cloud | Firebase Auth anônimo e Firestore | Integração inicial, sem modelo de workspace multiusuário real |
| Testes | Jest, Testing Library e testes de componentes/contexto | Boa intenção e cobertura de fluxos centrais; não foi possível executar por dependências não instaladas |
| Build e lint | Scripts presentes no `package.json` | Não validados porque `node_modules` não está instalado no clone |
| Histórico | Dois commits, sendo um commit inicial e um commit grande de implementação | Projeto em fase inicial, com pouca decomposição histórica |

A árvore de código está concentrada em `src/app`, `src/components`, `src/contexts`, `src/lib` e `src/types`. O domínio principal está fortemente centralizado em `RoadmapContext.tsx`, que hoje acumula estado, persistência, sincronização, filtros, estatísticas, CRUD e toasts.

## 3. Funcionalidades existentes

### 3.1 Fluxo do roadmap

O usuário pode criar uma ideia pela captura rápida. A ideia entra inicialmente na Inbox com título, descrição vazia, checklist vazio, criador e data de criação. O board apresenta as colunas `Agora`, `A Seguir` e `Mais Tarde`, além da Inbox lateral. As colunas possuem semântica visual própria e estados vazios amigáveis.

O cartão apresenta título, projeto, responsável, tag, esforço, pontuação ICE e progresso do checklist. Ao selecionar um cartão, abre-se um `IdeaDrawer`, evitando o uso de modal central para edição contextual. O painel permite editar título, descrição, projeto, status, tag, esforço, impacto, confiança, responsável e checklist, além de excluir o item.

### 3.2 Pesquisa, filtros e analytics

Existe busca textual sobre título e descrição, filtro por tag e filtro por responsável. O contexto calcula total de itens, distribuição por status, taxa de conclusão baseada no checklist, pontos de esforço e itens sem responsável.

O dashboard analítico é útil como visão inicial, mas ainda representa uma camada de indicadores sobre o roadmap, não uma visão operacional de engenharia. Parte do conteúdo é estático, como referências de planejamento e saúde do projeto, portanto precisa ser separada de métricas calculadas antes de ser usada para tomada de decisão.

### 3.3 Equipe e sincronização

A aplicação possui uma equipe padrão com três membros. É possível adicionar, editar e remover membros, trocar o usuário corrente e alternar entre modo local e modo cloud. No modo cloud, o código tenta autenticar anonimamente no Firebase e observa coleções de itens e equipe com `onSnapshot`.

Esse mecanismo demonstra uma direção correta para colaboração, mas não configura colaboração real. Os membros não são contas autenticadas, não há convite, não há controle de acesso, não há workspace criado por usuário e não há regras de autorização verificáveis no repositório.

### 3.4 Autenticação

A página de login possui validação client-side e uma experiência visual pronta, porém o envio apenas aguarda um atraso, registra os dados no console e redireciona para a home. Não existe criação de sessão, autenticação por email e senha, OAuth, proteção de rotas ou vínculo entre usuário autenticado e ações realizadas.

## 4. Arquitetura e pontos fortes

A separação entre componentes de layout, componentes de domínio, componentes de UI, contexto e tipos fornece uma estrutura compreensível para um protótipo. O uso de tipos como `RoadmapItem`, `TeamMember`, `Subtask`, `EffortLevel` e `ImpactLevel` também ajuda a tornar o domínio explícito.

A escolha do `@dnd-kit` é apropriada para construir uma experiência de quadro. O uso de um drawer lateral para edição detalhada é coerente com o contexto visual do board. A presença de testes para `RoadmapContext`, `RoadmapCanvas`, `SidebarInbox`, `Navbar`, `IdeaDrawer` e `LoginForm` indica preocupação com comportamento e não apenas com renderização.

A persistência local é um bom mecanismo de prototipação e pode ser reaproveitada como cache offline depois que a persistência remota for reorganizada. A função de migração local para cloud também revela uma preocupação válida com a transição de dados.

## 5. Problemas técnicos identificados

### 5.1 Validação não executável no estado clonado

Os scripts de teste, build e lint estão definidos, mas falharam imediatamente porque os executáveis `jest`, `next` e `eslint` não estão disponíveis no ambiente do clone. Isso significa que o estado funcional ainda precisa ser validado após a instalação das dependências com `npm ci`.

Não é correto concluir que os testes ou o build estão quebrados; a conclusão objetiva é que **eles ainda não foram executados neste clone por ausência de `node_modules`**. A primeira atividade técnica antes de alterar o produto deve ser instalar dependências e executar `npm ci`, `npm test -- --runInBand`, `npm run lint` e `npm run build`.

### 5.2 Domínio centralizado demais

`RoadmapContext.tsx` possui aproximadamente 395 linhas e reúne responsabilidades que devem ser separadas: hidratação local, estado de itens, estado de equipe, sincronização Firebase, cálculo de métricas, filtros, CRUD, migração e notificações.

Esse desenho torna mais difícil implementar permissões, atualizações otimistas, tratamento de erros, paginação, cache, reconciliação e auditoria. Recomenda-se extrair adaptadores de persistência, serviços de workspace, seletores de métricas e hooks específicos.

### 5.3 Identidade e autorização insuficientes

O tipo `TeamMember` representa um membro visual, não uma identidade de autenticação. A troca de usuário pelo Navbar apenas escolhe um objeto do estado local. Consequentemente, `createdBy` e `assigneeId` não podem ser considerados evidências confiáveis de autoria ou permissão.

A evolução precisa introduzir entidades separadas para `User`, `WorkspaceMember` e `Workspace`. O papel deve ser uma enumeração controlada, com autorização aplicada no backend e nas regras do Firestore, não apenas ocultando botões na interface.

### 5.4 Persistência cloud incompleta

O workspace está fixado na constante `APP_ID = 'codenu-roadmap-v1'`. Itens e equipe são gravados em caminhos globais derivados desse identificador. Não existem documentos de quadro, listas, convites, preferências por usuário, eventos de atividade ou configurações de workspace.

A sincronização também não trata explicitamente estados de carregamento, erros de assinatura, falha de autenticação, remoção de todos os documentos, concorrência ou conflitos. A lógica só substitui itens cloud quando o snapshot tem pelo menos um documento, o que pode preservar dados antigos em memória quando a coleção fica vazia.

### 5.5 Drag-and-drop com regra simplificada

Em `page.tsx`, o destino do drop é convertido diretamente para `RoadmapStatus`. Essa estratégia funciona para colunas simples, mas precisa ser ampliada para distinguir cartão, coluna, ordenação e outros destinos. Atualmente, a estrutura de dados não possui `position` ou `order`, portanto não há ordenação persistente de cartões dentro das listas.

Para um produto semelhante ao Trello, o cartão precisa guardar uma posição estável ou usar uma estratégia de ranking. A operação deve ser transacional ou otimista com rollback, principalmente quando várias pessoas movimentarem cartões ao mesmo tempo.

### 5.6 Tipagem e manutenção

Foram encontrados usos de `any` em login, drag-and-drop, lista de itens e campos do drawer. Também existem `console.log` de dados de login e erros de formulário. Além de reduzir a segurança do TypeScript, isso pode expor informação sensível em ambientes de desenvolvimento e produção.

Há componentes extensos, especialmente `IdeaDrawer`, `Navbar`, `RoadmapContext` e a página principal. O código deve ser dividido por responsabilidade, com tipos compartilhados para eventos de formulário, status, permissões e operações de quadro.

## 6. Lacunas em relação a uma plataforma colaborativa estilo Trello

| Capacidade | Situação atual | Necessidade para o produto-alvo |
|---|---|---|
| Workspace | Um identificador fixo no código | Workspace criado, selecionado e compartilhável |
| Quadro | Um roadmap implícito | Vários boards por workspace e configuração de visibilidade |
| Listas | Status fixos no tipo `RoadmapStatus` | Listas customizáveis, reordenação e limites opcionais |
| Cartões | Ideias com metadados ICE | Cartões com descrição, labels, membros, prazo, anexos, comentários e atividade |
| Usuários | Membros simulados | Autenticação real e perfis persistentes |
| Convites | Ausentes | Convites por email/link, aceite e remoção de membros |
| Permissões | Campo textual de papel | RBAC real para administrador, editor e visualizador |
| Colaboração | Snapshot Firebase inicial | Atualização em tempo real, presença, autoria e histórico |
| Ordenação | Sem posição persistida | Ordem estável por lista e movimentação entre listas |
| Comentários | Ausentes | Discussão por cartão com autoria e data |
| Auditoria | Ausente | Timeline de alterações, movimentações e comentários |
| Notificações | Apenas toasts locais | Notificações de atribuição, menção, prazo e atividade |
| Desenvolvimento de software | Projeto e checklist simples | Prioridade, sprint, tipo, status técnico, estimativa, dependências e links de PR/issue |
| Busca | Título e descrição local | Busca por board, lista, membro, label, prazo e conteúdo indexado |
| Offline | `localStorage` | Cache offline com fila de mutações e reconciliação |
| Analytics | KPIs básicos e conteúdo parcialmente estático | Métricas operacionais derivadas de eventos e filtros reais |

O ponto mais importante é separar o conceito atual de **roadmap de ideias** do conceito futuro de **sistema de execução de trabalho**. O roadmap pode continuar existindo como uma visualização ou tipo de board, mas o modelo de dados precisa ser generalizado para suportar múltiplos fluxos.

## 7. Modelo de domínio recomendado

A base futura pode ser organizada em torno das entidades abaixo.

| Entidade | Responsabilidade principal |
|---|---|
| `User` | Identidade autenticada, nome, avatar e preferências pessoais |
| `Workspace` | Organização isolada dos dados, configurações e plano de acesso |
| `WorkspaceMember` | Relação entre usuário e workspace, com papel e status |
| `Board` | Quadro de trabalho dentro de um workspace |
| `BoardList` | Lista ordenável de um board, como Backlog, Em desenvolvimento e Concluído |
| `Card` | Unidade de trabalho, com título, descrição, posição e metadados |
| `CardMember` | Associação entre cartão e usuários responsáveis/observadores |
| `Label` | Classificação configurável por board |
| `Checklist` e `ChecklistItem` | Subtarefas e progresso do cartão |
| `Comment` | Conversa contextual com autoria e data |
| `ActivityEvent` | Histórico imutável de ações relevantes |
| `Notification` | Eventos direcionados a um usuário |
| `Attachment` | Referência a arquivos ou links externos |

O `RoadmapItem` atual pode ser migrado para `Card`. O campo `status` deve ser substituído por `listId`; `tag` deve evoluir para labels; `assigneeId` deve ser substituído por uma associação de membros; `createdBy` deve apontar para `User`; e novos campos devem incluir `boardId`, `position`, `updatedAt`, `dueDate`, `priority`, `type`, `sprintId` e `archivedAt`.

## 8. Plano de evolução priorizado

### Fase 0 — Baseline e estabilização

Instalar as dependências, executar testes, lint e build, registrar as falhas reais e corrigir a base antes de iniciar mudanças de domínio. Remover `any` dos fluxos centrais, substituir logs de dados de login por tratamento seguro e criar testes de contrato para operações de persistência.

### Fase 1 — Workspace, board e listas

Criar `Workspace`, `Board` e `BoardList`, com um seed compatível com o roadmap atual. Transformar `now`, `next`, `later` e `inbox` em listas configuráveis, preservando a apresentação atual como experiência inicial. Adicionar `position` persistida para cards e listas.

### Fase 2 — Autenticação e autorização

Integrar o login ao Firebase Auth ou ao provedor escolhido, proteger rotas, identificar o usuário atual pelo token e criar regras de segurança por workspace. Implementar convite, aceite, remoção e papéis reais. O seletor visual de perfil deve deixar de ser a fonte de identidade.

### Fase 3 — Colaboração operacional

Adicionar comentários, menções, atividade do cartão, histórico de mudanças, atribuição múltipla, watchers, datas de vencimento e notificações. A experiência deve mostrar claramente quem alterou o quê e quando.

### Fase 4 — Fluxo de desenvolvimento de software

Adicionar tipos de cartão, prioridade, estimativa, sprint, dependências, links de pull request, issue externa e ambientes. O checklist pode evoluir para critérios de aceite. Também é recomendável suportar visualizações de board, roadmap e, posteriormente, tabela.

### Fase 5 — Confiabilidade e escala

Separar adaptadores local/cloud, adotar atualizações otimistas com rollback, tratar conectividade, adicionar paginação ou carregamento incremental, observar erros e criar testes de integração. Para colaboração em tempo real, definir estratégia de concorrência e garantir idempotência das mutações.

## 9. Backlog inicial recomendado para o próximo ciclo

| Ordem | Entrega | Critério de aceite |
|---:|---|---|
| 1 | Instalação e baseline de qualidade | Testes, lint e build executam com resultado registrado |
| 2 | Tipos de workspace, board, lista e card | O modelo suporta mais de um board e listas configuráveis |
| 3 | Posição persistida de cartões | Reordenar dentro da lista e mover entre listas mantém a ordem após recarregar |
| 4 | Firebase Auth real | Usuário autenticado permanece identificado e a rota principal é protegida |
| 5 | Regras de segurança | Usuário só acessa workspaces dos quais é membro |
| 6 | Convites e papéis | Administrador, editor e visualizador têm permissões verificáveis |
| 7 | Comentários e activity feed | Cada cartão mostra discussão e histórico com autoria real |
| 8 | Tratamento de erros e estados de sincronização | Interface informa carregamento, sucesso, falha e tentativa novamente |
| 9 | Busca e filtros de board | Filtros incluem lista, label, membro, prioridade e prazo |
| 10 | Testes de colaboração | Fluxos críticos cobrem autorização, concorrência básica e atualizações remotas |

## 10. Decisão arquitetural recomendada

A recomendação é manter Next.js, React, TypeScript, Tailwind e `@dnd-kit`, pois não há motivo imediato para uma reescrita tecnológica. O que precisa mudar é o desenho do domínio e da persistência.

O `RoadmapContext` deve deixar de ser o ponto único de toda a aplicação. Uma estrutura intermediária pode conter `domain/types`, `services/workspace`, `services/boards`, `services/cards`, `repositories/local` e `repositories/firebase`, além de hooks como `useWorkspace`, `useBoard`, `useCards` e `useActivity`. A UI continuará consumindo hooks, enquanto os adaptadores ocultam a diferença entre local e cloud.

Para o MVP colaborativo, o Firebase é suficiente se forem implementados corretamente Auth, Firestore Rules, índices, estrutura por workspace e tratamento de erros. Se o produto exigir consultas relacionais complexas, relatórios avançados ou automações extensas, pode-se reavaliar posteriormente uma API dedicada e banco relacional; essa decisão não é necessária para a primeira evolução.

## 11. Conclusão

O clone está íntegro, alinhado à branch principal e possui uma base de interface promissora. O projeto já resolve bem a captura e organização visual de ideias, mas ainda não resolve os fundamentos de um produto colaborativo: identidade, autorização, multi-workspace, ordenação persistente, histórico, comunicação e confiabilidade de sincronização.

A estratégia mais segura é **evoluir sem apagar a experiência atual**. O primeiro incremento deve transformar o roadmap fixo em um board configurável com listas e posições persistentes. Em paralelo, a autenticação real e as regras de segurança devem ser tratadas como fundação, não como acabamento. Com isso, as funcionalidades de equipe semelhantes ao Trello poderão ser adicionadas sobre um núcleo coerente e sustentável.

## Referência do material analisado

A análise foi elaborada diretamente a partir do código, testes, configuração, documentação e histórico Git presentes no clone local do repositório `tigocode/codenu-roadmap`, na branch `main`, especialmente no commit `9ce5fec`.
