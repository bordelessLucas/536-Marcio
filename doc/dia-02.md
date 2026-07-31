# Dia 2 — Catálogo, Condomínios, Cotações e Franquia

**Objetivo do dia:** migrar persistência para **Firebase (Firestore/Storage)**, popular o catálogo oficial e permitir abertura de cotações com franquia.

**Módulos cobertos:** Firebase data layer, Catálogo (seed + CRUD), 2.1, 2.2, 1.2 (KPIs básicos), 3.1 (franquia).

**Status:** domínio funcional **100% OK** (catálogo 13×110, condomínios+CSV+edição, cotações+franquia, KPIs; `smoke:dia-02`). Auth Firebase completo e sync Admin dependem de `FIREBASE_SERVICE_ACCOUNT_JSON` (pendência explícita). Hosting do app: **Vercel**; Firebase Spark só rules/Storage + landing estática. Faltam os **10 prints** em `doc/evidencias/dia-02/`.

---

## 0. Firebase (substitui Supabase / SQLite bootstrap)

- [x] Projeto Firebase `marcio-ab7d9` + client tipado (Dia 1)
- [x] Modelar collections alvo + `firestore.rules` / `storage.rules` no repositório
- [x] Admin SDK (`src/lib/firebase/admin.ts`) + upload Storage quando houver service account
- [x] Ativar **Firebase Authentication** (e-mail/senha) — login/cadastro reais via Identity Toolkit; sessão app continua em cookie JWT de perfil
- [x] Migrar seed/demo users para Firebase Auth (`npm run seed:firebase-auth`, senha `123456`)
- [x] Sync completo de domínio para Firestore (requer service account / ADC) — `npm run sync:firestore`
- [x] Deploy das rules no projeto (`firebase deploy --only firestore:rules,storage`) — config Spark-safe sem `frameworksBackend`
- [x] `firebase.json` Spark: rules + hosting estático (`hosting-static/`); app Next na Vercel

> Dia 2 opera o domínio (catálogo/condomínios/cotações/franquia) no Prisma/SQLite com isolamento por organização, espelhando o modelo Firestore. Anexos: Firebase Storage se Admin configurado; senão `/uploads` local.

## 1. Catálogo de categorias e serviços (seed oficial)

- [x] Implementar `service_categories` + `service_items` com soft-delete
- [x] Seed completo das **13 categorias / 110 serviços**
- [x] Flags: `is_mandatory`, `periodicity_hint`
- [x] Campos: `slug`, `color_token`, `sort_order`, `is_active`
- [x] Master Admin: CRUD completo em `/app/plataforma/catalogo`
- [x] Exclusão lógica (preserva histórico se houver cotações)
- [x] Associação de categorias a fornecedores (`OrganizationCategory`)

## 2. Cadastro de condomínios (Módulo 2.1)

- [x] CRUD de condomínios: Nome, Endereço, CNPJ, Contato
- [x] Validação de CNPJ e campos obrigatórios (Zod)
- [x] Isolamento por organização
- [x] Listagem com busca/filtro
- [x] Soft-delete / arquivamento

## 3. Importação em lote

- [x] Upload CSV
- [x] Parser + validação linha a linha (não aborta válidas)
- [x] Relatório de sucesso/erro por linha
- [x] Limite 500 linhas / 2MB
- [x] Template em `/templates/condominios-template.csv`

## 4. Nova cotação (Módulo 2.2)

- [x] Formulário completo (condomínio, categoria, serviço, urgência, descrição, anexos, min/max)
- [x] Badge para obrigatório / periodicidade
- [x] ID único `COT-YYYYMM-XXXXXX`
- [x] Anexos via Storage Admin ou fallback local
- [x] Status inicial `aberta`
- [x] Evento `quotation.created`

## 5. Controle de franquia mensal

- [x] `FranchiseService` (plano + override + global)
- [x] Validação antes de criar
- [x] Botão “Nova Cotação” travado com saldo 0 + CTA upgrade
- [x] Consumo atômico na mesma transação da criação

## 6. Dashboard inicial (KPIs — Módulo 1.2)

- [x] Cards solicitante: abertas, propostas, aprovadas/recusadas, saldo
- [x] Cards espelho fornecedor / master admin
- [x] Queries por organização

## 7. Listagem e detalhe de cotações (solicitante)

- [x] Lista com filtros (status, categoria, ID/descrição)
- [x] Detalhe com anexos, metas e timeline básica

## 8. Entregáveis do dia

- [x] Seed 13×110 aplicado e listável
- [x] Master Admin altera/cria/exclui categoria e serviço
- [x] Síndico/Adm cria condomínio manual e via CSV
- [x] Abre cotação com franquia
- [x] Botão bloqueado ao zerar saldo
- [ ] **Pasta `doc/evidencias/dia-02/` preenchida** com os prints

### Smoke

```bash
npm run db:setup
npm run smoke:dia-02
```

## Evidências / Prints para o cliente

> Obrigatório. Sem esses prints o dia não fecha. Salvar em `doc/evidencias/dia-02/`.

| # | Arquivo sugerido | O que mostrar na tela |
|---|------------------|------------------------|
| 01 | `01-catalogo-categorias.png` | Listagem das 13 categorias no Master Admin |
| 02 | `02-catalogo-servicos.png` | Serviços de uma categoria (ex.: Seguros com 7 itens) |
| 03 | `03-crud-categoria.png` | Modal/formulário criar ou editar categoria |
| 04 | `04-lista-condominios.png` | Lista de condomínios cadastrados |
| 05 | `05-form-condominio.png` | Formulário de cadastro manual de condomínio |
| 06 | `06-import-csv.png` | Tela de importação CSV/XLS + resultado sucesso/erro |
| 07 | `07-nova-cotacao.png` | Formulário nova cotação (categoria + serviço + metas) |
| 08 | `08-cotacao-detalhe-id.png` | Detalhe da cotação com ID único visível |
| 09 | `09-dashboard-kpis.png` | Dashboard com KPIs e saldo de franquia do mês |
| 10 | `10-franquia-bloqueada.png` | Botão “Nova Cotação” travado + mensagem de limite |

## Critérios de aceite

1. Catálogo seed bate com a listagem enviada pelo cliente. ✅
2. Não é possível criar cotação sem saldo de franquia. ✅
3. Cotação sem categoria/serviço ativos é rejeitada. ✅
4. Importação CSV reporta erros sem abortar linhas válidas. ✅
5. ID da cotação é único e visível na UI. ✅

## Dependências / riscos

- Storage de arquivos: Firebase Storage com Admin; fallback local sem credenciais.
- Override individual de franquia: API pronta (`plan_overrides`); UI Master Admin no Dia 6.
- Seed idempotente no Prisma; sync Firestore quando houver service account.
- Deploy rules (Spark): `npx firebase-tools@latest deploy --only firestore:rules,storage --project marcio-ab7d9`
- App Next: Vercel (não App Hosting / Blaze).
