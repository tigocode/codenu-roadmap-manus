# Codenu Roadmap

Aplicação web para gerenciamento de ideias, roadmap e fluxo inicial de desenvolvimento de software. O projeto está sendo evoluído de um roadmap visual para uma plataforma colaborativa com autenticação Firebase, múltiplos workspaces, boards e uma interface Kanban com drag-and-drop.

> O repositório contém uma aplicação Next.js. Atualmente há duas experiências executáveis: a aplicação principal em `/` e o preview visual do Kanban em `/kanban`. Elas não são dois repositórios independentes.

## Pré-requisitos

| Requisito | Versão ou condição | Como verificar |
|---|---|---|
| Node.js | Versão compatível com Next.js 16; recomenda-se Node.js 20 ou superior | `node --version` |
| npm | Incluído com Node.js | `npm --version` |
| Firebase | Necessário para autenticação e dados reais | Firebase Console |
| Git | Necessário para clonar e versionar o projeto | `git --version` |

## Instalação local

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/tigocode/codenu-roadmap-manus.git
cd codenu-roadmap-manus
```

Instale as dependências exatamente conforme o lockfile:

```bash
npm ci
```

Crie o arquivo de variáveis local. Ele não deve ser versionado:

```bash
cp .env.example .env.local
```

Preencha os valores Firebase descritos na seção seguinte. Para executar apenas a interface visual, a rota `/kanban` também pode ser aberta sem credenciais, pois utiliza dados demonstrativos; login, workspaces e persistência real exigem Firebase configurado.

## Configuração do Firebase

No [Firebase Console](https://console.firebase.google.com/), crie ou selecione um projeto, registre uma aplicação Web em **Project settings → General → Your apps** e copie os valores da configuração Web para `.env.local`:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=seu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

Em **Build → Authentication → Sign-in method**, habilite **Email/Password**. Em seguida, crie o banco no **Cloud Firestore** e publique as regras do arquivo `firestore.rules`, revisando-as antes de qualquer uso em produção.

Os valores `NEXT_PUBLIC_FIREBASE_*` são configurações do SDK Web e serão expostos ao cliente. **Nunca coloque credenciais de service account, chaves privadas ou arquivos administrativos no frontend, em `.env.local` versionado ou no GitHub.** O procedimento detalhado está em [`CONFIGURAR_FIREBASE.md`](./CONFIGURAR_FIREBASE.md).

## Executar em desenvolvimento

Inicie o servidor local:

```bash
npm run dev
```

Abra as páginas abaixo no navegador:

| URL | Finalidade |
|---|---|
| [http://localhost:3000/](http://localhost:3000/) | Roadmap principal e Inbox |
| [http://localhost:3000/login](http://localhost:3000/login) | Login e cadastro com Firebase Auth |
| [http://localhost:3000/kanban](http://localhost:3000/kanban) | Preview do layout Kanban com drag-and-drop |

Para alterar a porta, use o parâmetro padrão do Next.js:

```bash
npm run dev -- --port 3001
```

## Testes, lint e build

Execute os comandos abaixo antes de abrir um pull request:

```bash
npm test -- --runInBand
npm run lint
npm run build
```

A suíte atual utiliza Jest e Testing Library. O lint usa ESLint integrado ao Next.js. O build executa a compilação TypeScript e a geração otimizada das rotas da aplicação.

## Estrutura principal

| Caminho | Responsabilidade |
|---|---|
| `src/app/` | Rotas e layouts do App Router |
| `src/components/auth/` | Formulários de login e cadastro |
| `src/components/kanban/` | Board, colunas e cartões arrastáveis |
| `src/components/layout/` | Navbar, Inbox e canvas legado |
| `src/components/roadmap/` | Cartões e painel detalhado do roadmap |
| `src/contexts/AuthContext.tsx` | Sessão Firebase observável |
| `src/contexts/WorkspaceContext.tsx` | Workspaces, boards, listas e membership |
| `src/lib/firebase.ts` | Inicialização do SDK Firebase |
| `src/lib/kanban.ts` | Cálculo e reindexação de posições |
| `src/types/` | Contratos de domínio TypeScript |
| `firestore.rules` | Regras iniciais de autorização do Firestore |
| `CONFIGURAR_FIREBASE.md` | Guia detalhado de configuração do Firebase |
| `PLANO_KANBAN_TRELLO.md` | Plano de evolução da interface Kanban |
| `ANALISE_PROJETO.md` | Diagnóstico técnico inicial do projeto |

## Estado atual do Kanban

O preview `/kanban` já possui listas, cartões, estados vazios, contadores, pesquisa visual, botão de filtros, drag overlay e atualização otimista de posição. A função `onMoveCard` é o ponto de integração para persistir `listId` e `position` no Firestore.

A próxima etapa é conectar a coleção `cards` ao `WorkspaceContext`, persistir a movimentação com segurança, implementar criação e edição de cartões e substituir os dados demonstrativos pelos boards do usuário autenticado.

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| `auth/operation-not-allowed` | Email/Password não está habilitado | Ative o provedor no Firebase Authentication |
| `permission-denied` no Firestore | Regras ou membership incompatíveis | Revise `firestore.rules` e confirme o membership do workspace |
| Variáveis Firebase indefinidas | `.env.local` ausente ou com nomes incorretos | Copie `.env.example`, preencha os seis nomes e reinicie o servidor |
| Porta 3000 ocupada | Outro processo local está usando a porta | Execute `npm run dev -- --port 3001` |
| Build usando valores antigos | Next.js manteve cache ou o servidor não foi reiniciado | Pare o servidor, atualize `.env.local` e execute novamente |

## Segurança e versionamento

Mantenha `.env.local` fora do Git e publique somente `.env.example` com nomes de variáveis, nunca com valores reais. Antes de publicar regras ou liberar o projeto para uma equipe, teste os fluxos de leitura e escrita com o Firebase Emulator Suite e revise as permissões por workspace, board e membership.

## Referências

[1]: https://nextjs.org/docs "Next.js Documentation"
[2]: https://firebase.google.com/docs/web/setup "Firebase Web Setup"
[3]: https://firebase.google.com/docs/auth/web/password-auth "Firebase Email and Password Authentication"
[4]: https://firebase.google.com/docs/firestore/security/get-started "Cloud Firestore Security Rules"
[5]: https://docs.npmjs.com/cli/v10/commands/npm-ci "npm ci Documentation"
