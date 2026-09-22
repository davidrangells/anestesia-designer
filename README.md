# Anestesia Designer

Aprovação de conteúdo para o Instagram do Anestesia Questões. Next.js + Firebase (Auth Google, Firestore, Storage), deploy na Vercel em `designer.anestesiaquestoes.com.br`.

## Rodar local
```bash
cp .env.local.example .env.local   # preencha com a config do app web do Firebase
npm install
npm run dev
```

## Regras e acesso
- `firestore.rules` e `storage.rules`: só entra quem está em `users/{email}` ou na lista `bootstrapAdmins`.
- Papéis: `produtor`, `aprovador`, `admin`. Gerencie em /equipe.
- Deploy das regras: `firebase deploy --only firestore:rules,storage`.

## Fluxo
Importar pasta (iCloud) → posts entram "Em revisão" → aprovador aprova ou pede ajuste com comentário → produtor corrige e reenvia → aprovado → publicado.
