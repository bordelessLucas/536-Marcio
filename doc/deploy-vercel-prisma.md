# Deploy produção — Vercel + Prisma Postgres

Contexto para outros devs: como a app está publicada, onde está o banco e o que foi feito no claim.

## Visão geral

| Camada | Onde | URL |
|--------|------|-----|
| Landing estática (marketing) | Firebase Hosting | https://marcio-ab7d9.web.app |
| App Next.js (cadastro, login, `/app`) | Vercel | https://cotacondo-marcio.vercel.app |
| Banco de dados | Prisma Postgres (claimed) | Dashboard Prisma Console |

Fluxo do usuário:

1. Entra na landing no Firebase.
2. Clica em **Começar** / **Acesse** / **Cadastro**.
3. É redirecionado para a app na Vercel (`appUrl` em `hosting-static/js/config.js`).

## Vercel

- **Projeto:** `cotacondo-marcio`
- **Time/conta:** `bordelesslucas-projects` (conta CLI: `bordelesslucas`)
- **Repo ligado:** `https://github.com/bordelessLucas/536-Marcio`
- **URL de produção:** https://cotacondo-marcio.vercel.app
- **Framework:** Next.js 15 (App Router)
- **Build:** `prisma generate && next build` (ver `vercel.json`)

### Variáveis de ambiente (Vercel)

Configuradas em Production / Preview / Development. Principais:

- `DATABASE_URL` — connection string do Prisma Postgres (sensível)
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL` = `https://cotacondo-marcio.vercel.app`
- `NEXT_PUBLIC_FIREBASE_*` (projeto `marcio-ab7d9`)
- `NEXT_PUBLIC_BLOG_URL`, `NEXT_PUBLIC_WHATSAPP_URL`
- `PAYMENT_PROVIDER` = `sandbox`

Para listar/atualizar:

```bash
npx vercel env ls
npx vercel env pull .env.local
```

Deploy:

```bash
npx vercel --prod --yes
```

## Banco: Prisma Postgres (claim)

### Por que Postgres

Na Vercel o SQLite local (`file:./dev.db`) **não funciona** (filesystem efêmero/serverless). O `prisma/schema.prisma` usa:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### O que foi o “claim”

1. No primeiro deploy foi criado um banco **temporário** via `npx create-db` (TTL ~24h).
2. Esse banco foi **claimed** na conta Prisma do time (“You have successfully claimed your database”).
3. Após o claim, o banco **não expira** mais por TTL — passa a ser gerenciado no Prisma Console.

Dados iniciais (seed) já foram aplicados: planos (Cota/Condo/VIP), orgs e usuários demo.

### Seed / schema em produção

Com a `DATABASE_URL` de produção no ambiente:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Contas demo (senha `123456`), se o seed tiver rodado:

- `admin@cotacondo.com.br`
- `sindico@demo.cotacondo.com.br`
- `fornecedor@demo.cotacondo.com.br`
- `adm.master@demo.cotacondo.com.br`
- `adm.operacional@demo.cotacondo.com.br`

Sincronizar Auth Firebase (se necessário):

```bash
npm run seed:firebase-auth
```

## Firebase Hosting (landing)

Pasta pública: `hosting-static/`.

O ponteiro para a app Next está em:

```js
// hosting-static/js/config.js
window.COTACONDO = {
  appUrl: "https://cotacondo-marcio.vercel.app",
  // ...
};
```

Redeploy só da landing:

```bash
npx firebase-tools@latest deploy --only hosting --project marcio-ab7d9
```

## Firebase Auth — domínio autorizado

No Console Firebase → Authentication → Settings → **Authorized domains**, incluir:

- `cotacondo-marcio.vercel.app`
- `marcio-ab7d9.web.app` (se ainda não estiver)

Sem isso, login/cadastro no domínio da Vercel pode falhar.

## Dev local

Atenção: o schema está em **PostgreSQL**. O `.env` antigo com `file:./dev.db` **não** funciona com o schema atual.

Opções:

1. Usar a mesma `DATABASE_URL` do Prisma Postgres (pull via `vercel env pull` ou copiar do Prisma Console) — cuidado em ambientes compartilhados.
2. Subir um Postgres local e apontar `DATABASE_URL` para ele + `prisma db push` + seed.

## Checklist rápido para um novo dev

- [ ] Conta Vercel com acesso ao projeto `cotacondo-marcio`
- [ ] Conta Prisma com acesso ao banco claimed (Console)
- [ ] `npx vercel link` no repo
- [ ] `npx vercel env pull .env.local`
- [ ] Confirmar `provider = "postgresql"` no schema
- [ ] Authorized domain da Vercel no Firebase Auth
- [ ] Landing Firebase com `appUrl` apontando para a Vercel correta

## Histórico resumido (ago/2026)

1. Ajustes de copy/planos do PDF → landing Firebase + app Next.
2. Deploy Firebase Hosting (`marcio-ab7d9.web.app`).
3. “Começar” 404 porque `appUrl` apontava para outro Vercel (`cotacondo.vercel.app`).
4. App deste repo publicada em `cotacondo-marcio.vercel.app`.
5. Postgres temporário criado → **claim** → banco permanente na conta Prisma.
6. `appUrl` do Firebase atualizado para a Vercel correta.
