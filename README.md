# CotaCondo

Plataforma SaaS de cotações para condomínios.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- **Firebase** (projeto `marcio-ab7d9`): Auth, Firestore, Storage, Analytics
- Poppins + assets em `/public/brand`

> O bootstrap do Dia 1 ainda possui session JWT + SQLite local para as telas. O alvo oficial de dados/auth é **Firebase** (não Supabase).

## Setup local

```bash
cp .env.example .env
# Preencha as variáveis NEXT_PUBLIC_FIREBASE_* (já no .env do time)
npm install
npm run db:setup   # bootstrap local temporário
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Contas demo (bootstrap local)

Senha: `Demo@123456`

| E-mail | Perfil |
|--------|--------|
| admin@cotacondo.com.br | Master Admin |
| sindico@demo.cotacondo.com.br | Síndico |
| fornecedor@demo.cotacondo.com.br | Fornecedor |
| adm.master@demo.cotacondo.com.br | Adm Master |
| adm.operacional@demo.cotacondo.com.br | Adm Operacional |

## Scripts

- `npm run dev` — desenvolvimento
- `npm run lint` / `npm run typecheck`
- `npm run db:setup` — push schema local + seed (temporário)
- `npm run build` — build de produção

## Documentação

Ver pasta [`/doc`](./doc), especialmente `documentation.md` e os `dia-0X.md`.
