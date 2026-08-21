# Configuração do Firebase

## 1. Criar ou selecionar o projeto

No [Firebase Console](https://console.firebase.google.com/), crie um projeto ou selecione o projeto que será usado pelo Codenu Roadmap. Em **Project settings → General → Your apps**, registre uma aplicação Web e copie o objeto de configuração exibido pelo Firebase.

A configuração Web contém valores públicos do SDK, como `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` e `appId`. Ela não substitui regras de segurança e não deve ser confundida com uma chave privada de conta de serviço. **Nunca coloque um JSON de service account, sua chave privada ou credenciais administrativas em `.env.local` do frontend.**

## 2. Criar `.env.local`

Na raiz do projeto, copie `.env.example` para `.env.local` e substitua os valores pelos dados da aplicação Web:

```bash
cp .env.example .env.local
```

O arquivo deve ficar semelhante a:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=seu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

O prefixo `NEXT_PUBLIC_` é necessário porque a inicialização do SDK acontece no navegador. O arquivo `.env.local` deve permanecer fora do Git; valide com `git status --ignored` se necessário e nunca faça commit dele.

## 3. Habilitar autenticação

No console do Firebase, acesse **Build → Authentication → Sign-in method**, habilite **Email/Password** e salve. O `AuthContext` do projeto utiliza `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `onAuthStateChanged` e `signOut`.

## 4. Criar o Firestore

Em **Build → Firestore Database**, crie o banco no ambiente adequado. Depois publique as regras do arquivo `firestore.rules` usando o Firebase CLI ou copie o conteúdo para **Firestore Database → Rules**. Antes de produção, revise as regras com o Emulator Suite e confirme que cada leitura e gravação depende do membership do workspace.

## 5. Validar localmente

Inicie o projeto com:

```bash
npm run dev
```

Abra `/login`, crie um usuário de teste e confirme que a sessão permanece após recarregar a página. Depois valide a criação de workspace e board no Firestore. Se a aplicação reportar `auth/operation-not-allowed`, o provedor Email/Password ainda não foi habilitado; se reportar `permission-denied`, revise o membership e as regras do Firestore.

## 6. Variáveis em deploy

Em Vercel ou outro provedor, cadastre as mesmas seis variáveis em **Project Settings → Environment Variables** para os ambientes Preview e Production. Não use variáveis administrativas no cliente. Para operações server-side futuras, mantenha credenciais de service account exclusivamente no backend ou em secret manager.
