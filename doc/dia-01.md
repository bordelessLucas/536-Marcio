# Dia 1 — Fundação, Autenticação, Perfis, Schema e Brand

**Objetivo do dia:** deixar a base técnica, o modelo de acesso e a identidade visual prontos para app + site.

**Módulos cobertos:** Site (brand), 1.1 (parcial), 9 (estrutura), arquitetura base, LGPD inicial.

**Status:** implementação funcional e endurecimento de segurança **100% OK** (typecheck + `smoke:dia-01`). Falta anexar os **10 prints** em `doc/evidencias/dia-01/` para fechar formalmente com o cliente.

---

## 1. Setup do projeto

- [x] Inicializar monorepo/app (Next.js + TypeScript + Tailwind)
- [x] Configurar ESLint, Prettier, path aliases e TypeScript strict
- [x] Criar estrutura de pastas por domínio (`features/auth`, `features/quotations`, `features/marketing`, etc.)
- [x] Separar rotas públicas (`/`, `/fornecedores`) da área autenticada (`/app`)
- [x] Configurar variáveis de ambiente (`.env.example` sem secrets)
- [x] Configurar repositório Git + branch padrão + CI básico (lint/typecheck)
- [x] Definir ambientes: `local`, `staging`, `production`

## 2. Identidade visual (briefing do site)

- [x] Configurar fonte **Poppins** (next/font ou self-host)
- [x] Pasta `/public/brand` com logo e mascote (já versionados)
- [x] Tokens CSS básicos (cores da marca a partir do logo: rosa→roxo→azul→teal, tipografia, espaçamentos)
- [x] Componentes base: `Logo`, `Mascot`, `Button`, `Container`
- [x] Layout público mínimo do header (logo + placeholders dos 4 links do menu)

> Assets disponíveis: `logo.png`, `mascote.png`, `mascote-avatar-circular.png` — ver `public/brand/README.md`.

## 3. Banco de dados e schema inicial

- [x] Provisionar **Firebase** (projeto `marcio-ab7d9`) + config no `.env`
- [x] Client Firebase tipado (`src/lib/firebase/client.ts` — Auth, Firestore, Storage, Analytics)
- [x] Modelar entidades base (collections Firestore alvo):
  - `users`, `organizations`, `organization_members`
  - `plans`, `subscriptions`, `plan_overrides`
  - `service_categories`, `service_items` (estrutura; seed completo no Dia 2)
  - `landing_banners`, `marketing_settings`
  - `platform_settings`, `audit_logs`
- [x] Definir enums de perfil: `fornecedor`, `sindico`, `administradora`, `master_admin`
- [x] Definir roles internas da Administradora: `master` | `operational`
- [x] Criar seeds mínimos: Master Admin, planos Free padrão, settings (franquia 15, lembretes 5/10), WhatsApp placeholder
- [x] *Bootstrap Dia 1:* auth/session local + SQLite temporário para UI; **alvo oficial = Firebase Auth + Firestore**

## 4. Autenticação (Módulo 1.1)

- [x] Cadastro com validação Zod (e-mail, senha, tipo de perfil, dados básicos da organização)
- [x] Confirmação de cadastro em **duas etapas** (e-mail + token/código)
- [x] Login e logout seguros (sessão/JWT)
- [x] Recuperação de senha (fluxo completo)
- [x] Middleware de proteção de rotas autenticadas
- [x] Guard de autorização por perfil + role
- [x] Rota `/acesse` (ou `/login`) alinhada ao menu da landing

## 5. Shell da aplicação e interface por perfil

- [x] Layout base autenticado (header, menu lateral, área de conteúdo)
- [x] Menu lateral dinâmico conforme perfil/plano/permissão
- [x] Tela inicial placeholder por perfil (Fornecedor, Síndico, Adm Master, Adm Operacional, Master Admin)
- [x] Componente de avatar/perfil e logout

## 6. Segurança e LGPD (base)

- [x] Isolamento por organização via memberships (**Firestore Security Rules** nos próximos dias)
- [x] Tabela/registro de consentimento e política de privacidade no cadastro
- [x] Padronizar respostas de erro sem vazar dados sensíveis
- [x] Logging de auditoria para login, troca de senha e alteração de perfil

## 7. Entregáveis do dia

- [x] App sobe localmente com login funcional
- [x] Poppins + slots de logo/mascote aplicados
- [x] Schema/modelo versionado no repositório (`prisma/schema.prisma` como referência de domínio + Firebase no `.env`)
- [x] Diagrama ER das entidades do Dia 1 (`doc/er-dia-01.md`)
- [x] Checklist de smoke: cadastro → confirmação → login → menu correto por perfil
- [ ] **Pasta `doc/evidencias/dia-01/` preenchida** com os prints abaixo

## Evidências / Prints para o cliente

> Obrigatório. Sem esses prints o dia não fecha. Salvar em `doc/evidencias/dia-01/`.

| # | Arquivo sugerido | O que mostrar na tela |
|---|------------------|------------------------|
| 01 | `01-header-publico-logo.png` | Header público com logo CotaCondo + 4 links do menu |
| 02 | `02-tela-login.png` | Tela de login/Acesse com Poppins e identidade da marca |
| 03 | `03-cadastro-perfil.png` | Cadastro com seleção de perfil (Síndico/Fornecedor/Adm) |
| 04 | `04-confirmacao-duas-etapas.png` | Tela de confirmação de cadastro (código/e-mail) |
| 05 | `05-dashboard-sindico.png` | Shell autenticado + menu lateral do Síndico |
| 06 | `06-dashboard-fornecedor.png` | Menu/home do Fornecedor (diferente do Síndico) |
| 07 | `07-dashboard-adm-master.png` | Menu da Administradora Master |
| 08 | `08-dashboard-adm-operacional.png` | Menu da Adm Operacional (sem itens financeiros) |
| 09 | `09-master-admin.png` | Área do Master Admin da plataforma |
| 10 | `10-rota-protegida.png` | Tentativa sem login redirecionando para Acesse |

### Contas demo para prints

Senha: `Demo@123456`

- `sindico@demo.cotacondo.com.br`
- `fornecedor@demo.cotacondo.com.br`
- `adm.master@demo.cotacondo.com.br`
- `adm.operacional@demo.cotacondo.com.br`
- `admin@cotacondo.com.br`

## Critérios de aceite

1. Usuário consegue se cadastrar, confirmar e-mail e autenticar.
2. Cada perfil vê menu distinto.
3. Usuário não autenticado não acessa rotas privadas.
4. Tipografia Poppins carregada nas rotas públicas e autenticadas.
5. Schema base (incluindo categorias/banners) versionado; Firebase configurado no `.env`.

## Dependências / riscos

- **BaaS oficial: Firebase** (`marcio-ab7d9`) — Auth, Firestore, Storage, Analytics. **Não usamos Supabase.**
- Bootstrap do Dia 1 ainda usa session JWT + SQLite local para as telas; a migração completa para Firebase Auth + Firestore é o primeiro bloco do Dia 2.
- Templates de e-mail reais: no local o código/token aparece na UI de desenvolvimento; em Firebase usar e-mail verification / Cloud Functions.
- Smoke local: `npx tsx scripts/smoke-dia-01.ts` (requer `npm run dev` + seed).
