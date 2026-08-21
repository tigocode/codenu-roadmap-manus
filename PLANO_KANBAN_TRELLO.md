# Plano detalhado para o Kanban colaborativo

## Objetivo

Transformar o roadmap atual em um sistema Kanban colaborativo para desenvolvimento de software, preservando a Inbox e os metadados de priorização existentes, mas introduzindo múltiplos workspaces, boards, listas configuráveis, cartões ordenáveis, autenticação real e sincronização persistente.

A experiência deve se aproximar do Trello no que diz respeito à organização visual e colaboração, sem copiar sua identidade visual. O produto continuará com a identidade Codenu e poderá manter recursos próprios, como ICE Score, checklist e indicadores de esforço.

## Estado de fundação já iniciado

O projeto agora possui tipos para `Workspace`, `WorkspaceMember`, `Board`, `BoardList`, `Card`, `ActivityEvent` e `AuthenticatedUser`. Também foi adicionado um `AuthProvider` com Firebase Auth para login por email e palavra-passe, cadastro, logout, observação da sessão e mensagens de erro traduzidas para PT-BR.

O `WorkspaceProvider` já estabelece a estrutura de seleção e sincronização de workspaces, boards e listas, cria um workspace com membership de proprietário e cria boards com listas padrão. O login da página `/login` deixou de ser simulado e passou a chamar `signInWithEmailAndPassword` por meio do contexto de autenticação.

Foi adicionado um contrato inicial em `firestore.rules` e um `.env.example` para explicitar a configuração pública necessária. Antes de produção, essas regras precisam ser revisadas e publicadas no projeto Firebase real.

## 1. Arquitetura da interface proposta

| Região | Responsabilidade | Evolução a partir do estado atual |
|---|---|---|
| Sidebar global | Troca de workspace, boards favoritos, boards recentes, configurações e equipe | Evolui a Inbox lateral para navegação contextual e mantém Inbox como entrada rápida |
| Header do board | Nome, descrição, membros, busca, filtros, views e ações | Substitui o header centrado apenas em captura rápida |
| Área Kanban | Listas horizontais com cartões ordenáveis | Evolui `RoadmapCanvas` e elimina status fixos como única fonte de organização |
| Lista | Título, contador, menu, cor, botão de adicionar e limite opcional | Novo componente `BoardListColumn` |
| Cartão | Título, labels, membros, prazo, checklist, prioridade, estimativa e indicador de atividade | Evolui `IdeaCard` para `CardTile` |
| Drawer | Detalhamento contextual, comentários, atividade, checklist, anexos e propriedades | Evolui `IdeaDrawer` sem trocar por modal central |
| Barra inferior/móvel | Navegação e ações essenciais em telas pequenas | Complementa a sidebar responsiva existente |

O layout deve usar uma estrutura de duas camadas: uma sidebar global estreita e uma área de board com rolagem horizontal. A rolagem da página não deve competir com a rolagem de cada lista. Em mobile, a sidebar vira drawer e as listas devem continuar acessíveis por rolagem horizontal com snap suave.

## 2. Componentização alvo

A implementação deve separar a página atual em componentes com responsabilidades menores.

| Componente | Responsabilidade |
|---|---|
| `WorkspaceSidebar` | Listar workspaces, boards e ações de navegação |
| `WorkspaceSwitcher` | Trocar workspace e criar um novo |
| `BoardHeader` | Nome, membros, filtros, busca e view atual |
| `KanbanBoard` | Prover o contexto de drag-and-drop e organizar as listas |
| `BoardListColumn` | Renderizar uma lista, seu dropzone e seus cartões |
| `CardTile` | Renderizar resumo do cartão e iniciar drag |
| `CardComposer` | Criar cartão diretamente dentro da lista |
| `CardDrawer` | Editar propriedades e exibir atividade/comentários |
| `BoardFilters` | Aplicar filtros sem alterar a ordem persistida |
| `ActivityFeed` | Exibir histórico imutável do cartão ou board |
| `PresenceAvatars` | Mostrar membros ativos e responsáveis |
| `SyncStatus` | Mostrar sincronizando, salvo, offline e erro |

O `RoadmapContext` deve ser gradualmente substituído por hooks especializados. A UI não deve importar operações Firestore diretamente. As mutações devem passar por serviços ou hooks que permitam atualização otimista, rollback e invalidação de dados.

## 3. Modelo de ordenação persistente

Cada lista deve possuir uma sequência ordenada de cartões. A primeira versão pode usar números espaçados, por exemplo `1000`, `2000`, `3000`. Ao inserir entre dois cartões, calcula-se a média das posições vizinhas. Isso evita regravar todos os cartões em cada movimento.

Quando a distância entre posições se tornar pequena, deve ocorrer uma operação de reindexação da lista, gerando posições novamente espaçadas. Para evitar conflitos entre usuários, a reindexação deve ser feita em uma transação ou em uma operação de lote com `updatedAt` e verificação de versão.

O cartão deve conter, no mínimo, `boardId`, `listId`, `position`, `updatedAt` e `updatedBy`. O status visual deixa de ser gravado como enum fixo; ele é derivado da lista atual.

```text
Card A: position 1000
Card B: position 2000
Novo cartão entre A e B: position 1500
```

Para uma implementação mais resiliente no futuro, pode-se adotar um ranking lexicográfico, como LexoRank, mas a estratégia numérica espaçada é suficiente para o primeiro MVP.

## 4. Fluxo de drag-and-drop

O `DndContext` deve operar com identificadores de tipo explícito. Cada draggable deve usar um payload semelhante a `{ type: 'card', cardId, listId }`, e cada droppable deve usar `{ type: 'list', listId }` ou `{ type: 'card', cardId, listId }`.

O evento `onDragOver` deve atualizar apenas o preview local quando o cartão atravessar listas. O `onDragEnd` deve calcular a posição final e executar uma única mutação persistente. O fluxo recomendado é:

1. Capturar o estado original do cartão e das listas afetadas.
2. Aplicar uma atualização otimista no cache local.
3. Calcular `newListId` e `newPosition` com base no cartão anterior e posterior.
4. Persistir a alteração do cartão.
5. Criar um `ActivityEvent` de movimentação.
6. Confirmar ou reverter o cache se a operação falhar.
7. Informar o estado por meio de `SyncStatus` e toast não bloqueante.

A coluna de destino deve ganhar destaque durante o arrasto. O cartão arrastado deve aparecer em um `DragOverlay` com dimensões estáveis. O sistema deve impedir que um drop em área inválida altere o cartão.

## 5. Persistência e colaboração

A estrutura recomendada no Firestore é:

```text
users/{userId}/workspaces/{workspaceId}
workspaces/{workspaceId}
workspaces/{workspaceId}/members/{userId}
workspaces/{workspaceId}/boards/{boardId}
workspaces/{workspaceId}/boards/{boardId}/lists/{listId}
workspaces/{workspaceId}/boards/{boardId}/cards/{cardId}
workspaces/{workspaceId}/boards/{boardId}/activity/{eventId}
workspaces/{workspaceId}/boards/{boardId}/comments/{commentId}
```

Para consultas e regras mais simples, pode-se manter cards como subcoleção do board. Todas as entidades devem ter `createdAt`, `updatedAt` e, quando aplicável, `createdBy` e `updatedBy`.

A sincronização deve diferenciar quatro estados: `idle`, `saving`, `saved` e `error`. Quando o navegador estiver offline, as mutações devem permanecer em uma fila local, com identificador idempotente, e ser reenviadas quando a conexão retornar. Esse mecanismo deve ser introduzido depois do MVP online, mas o contrato de serviço deve ser desenhado desde o início.

## 6. Autenticação, membership e autorização

O Firebase Auth deve ser a única fonte de identidade. O `currentUser` antigo, que selecionava membros manualmente, deve ser removido gradualmente. A interface pode continuar mostrando avatares, mas o usuário selecionado deve vir da sessão autenticada.

Os papéis devem seguir uma regra clara: `owner` controla o workspace; `admin` gerencia membros, boards e configurações; `editor` cria e altera cartões; `viewer` apenas consulta, salvo comentários se essa decisão for aprovada. A autorização deve ser aplicada nas regras do Firestore e repetida na UI apenas para melhorar a experiência.

O fluxo de criação de conta deve criar o primeiro workspace automaticamente ou encaminhar o usuário para um onboarding. O fluxo de convite deve criar um registro pendente, permitir aceite autenticado e só então criar o membership definitivo.

## 7. Experiência do cartão para desenvolvimento de software

O cartão deve manter o título e a descrição do roadmap, mas ganhar propriedades orientadas a engenharia.

| Grupo | Campos recomendados |
|---|---|
| Planejamento | Tipo, prioridade, ICE Score, esforço, sprint e prazo |
| Execução | Lista, responsáveis, watchers, dependências e checklist |
| Engenharia | Branch, pull request, issue externa, ambiente e versão |
| Colaboração | Comentários, menções, atividade e anexos |
| Governança | Criador, última alteração, arquivado e permissões |

O drawer atual é o melhor ponto de extensão. A navegação deve ser dividida em seções ou abas leves: detalhes, checklist, comentários e atividade. A edição deve ser salva por campo ou por blocos curtos, com feedback imediato e rollback em erro.

## 8. Busca, filtros e views

A busca atual por título e descrição deve evoluir para filtros por lista, label, membro, prioridade, sprint, prazo e status de arquivamento. Os filtros não podem modificar a ordenação persistida; apenas alteram o conjunto visual exibido.

A primeira view será o Kanban. A segunda view recomendada é uma tabela para triagem e edição em massa. A view de roadmap atual pode ser mantida como uma configuração de board com listas sem prazo, não como um modelo separado.

## 9. Acessibilidade e responsividade

Cada lista deve ser navegável por teclado. Além do arrastar com ponteiro, deve existir ação acessível para mover o cartão para a lista anterior, próxima lista ou posição escolhida. O `@dnd-kit` deve receber os sensores de teclado e anúncios de acessibilidade.

O drawer deve ter foco inicial, foco preso durante a edição e retorno de foco ao cartão ao fechar. Botões de ícone precisam de `aria-label`, estados de carregamento e foco visível. A interface deve respeitar `prefers-reduced-motion`.

## 10. Ordem de implementação

| Sprint | Entrega | Resultado esperado |
|---:|---|---|
| 1 | Baseline, autenticação e configuração Firebase | Login real, sessão observável e build reproduzível |
| 2 | Workspace switcher e boards | Usuário cria e alterna entre múltiplos workspaces e boards |
| 3 | Listas configuráveis | Criar, editar, arquivar e reordenar listas |
| 4 | Cards persistentes | Cards gravados por board, com posição e lista |
| 5 | Drag-and-drop otimista | Mover e reordenar cards, persistindo posição e emitindo atividade |
| 6 | Drawer colaborativo | Responsáveis, labels, checklist, prazo e comentários |
| 7 | Membership e convites | Owner/admin/editor/viewer com regras verificáveis |
| 8 | Busca, filtros e qualidade | Testes de integração, estados offline e auditoria |

## 11. Critérios de aceite do MVP Kanban

O MVP será considerado pronto quando um usuário autenticado conseguir criar pelo menos dois workspaces, criar boards distintos em cada workspace, criar e reordenar listas, criar cartões dentro de uma lista e mover cartões entre listas.

A ordem dos cartões deve permanecer correta após recarregar a página. Dois usuários do mesmo workspace devem observar as alterações remotas sem precisar recarregar. Um usuário sem membership não deve ler nem alterar os dados do workspace. O usuário visualizador não deve conseguir mover ou editar cartões.

O sistema deve exibir estado de carregamento, estado vazio, erro de sincronização e confirmação de salvamento. Os testes devem cobrir criação de workspace, autorização, criação de board, cálculo de posição e rollback de uma movimentação que falhou.

## 12. Riscos e decisões abertas

A primeira decisão pendente é confirmar se o produto usará somente Firebase Auth com email/senha ou se também terá Google OAuth. A segunda é definir se a Inbox será uma lista especial dentro de cada board ou uma caixa de entrada global do workspace. A terceira é definir o comportamento offline e a política de conflitos para edição simultânea do mesmo cartão.

Também será necessário publicar e revisar as regras do Firestore em um projeto real, configurar índices e remover os fallbacks dummy do Firebase antes de qualquer uso com dados reais. O `.env.example` documenta a configuração, mas não substitui a criação e validação do projeto Firebase.
