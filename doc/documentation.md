# CotaCondo — Documentação Completa do Projeto

## 1. Visão Geral

**CotaCondo** é uma plataforma SaaS B2B que automatiza 100% o fluxo de cotação, negociação e contratação de serviços para condomínios.

### Premissa-chave

Todo o fluxo ocorre **exclusivamente dentro da plataforma**. Solicitantes (Síndico / Administradora) e Fornecedores são forçados a executar todas as etapas no sistema, gerando:

- Rastreabilidade e auditoria completas
- Growth Loop orgânico (Administradoras e Fornecedores incentivam entrada e upgrade de parceiros)
- Monetização via planos, categorias extras, comissionamento e indicações

### Problema que resolve

Condomínios e administradoras hoje fazem cotações por WhatsApp, e-mail e planilhas — sem comparativo padronizado, sem compliance documental e sem controle de franquia/planos. O CotaCondo centraliza esse processo com regras de negócio, distribuição inteligente de oportunidades e monetização do ecossistema.

### Superfícies do produto

| Superfície | URL / escopo | Objetivo |
|------------|--------------|----------|
| **Landing Page (one-page)** | Domínio principal (`cotacondo.com.br`) | Conversão de solicitantes + apresentação institucional |
| **LP Fornecedores** | `/fornecedores` e/ou subdomínio (`fornecedores.cotacondo.com.br`) | Conversão de fornecedores com copy específica + planos + checkout |
| **App autenticado (SaaS)** | `/app` (ou área logada) | Todo o fluxo operacional do escopo funcional |
| **Blog** | **Externo** (fora do one-page) | Conteúdo / SEO — link no menu, não faz parte da one-page |

---

## 2. Perfis de Usuário e Hierarquia

| Perfil | Descrição | Escopo de acesso |
|--------|-----------|------------------|
| **Fornecedor** | Empresa que responde a cotações | Oportunidades, propostas, compliance, CRM (Premium) |
| **Síndico (Solicitante)** | Responsável do condomínio | Condomínios, cotações, comparativo, aprovação |
| **Administradora — Master** | Gestor estratégico da administradora | Tudo da operacional + financeiro, comissões, parcerias, analytics |
| **Administradora — Operacional** | Usuário de operação | Gestão de condomínios, cotações, negociação e aprovação. **Sem** telas financeiras |
| **Master Admin** | Dono da plataforma CotaCondo | Parametrização global, auditoria, migrações, relatórios globais |

### Interface dinâmica

Tela inicial e menu lateral adaptados automaticamente conforme:

1. Perfil do usuário
2. Plano ativado
3. Nível de permissão (Master vs Operacional)

---

## 3. Site Público (Landing Page + LP Fornecedores)

> Fonte oficial: **Poppins**. Identidade visual com **logo** e **mascote/robô** da plataforma.
>
> Assets versionados em [`/public/brand`](../public/brand/README.md):
> - `logo.png` — wordmark + ícone (lupa/gráfico)
> - `mascote.png` — robô fundo claro (seção institucional da LP)
> - `mascote-avatar-circular.png` — robô em círculo com fundo verde (avatar/assistente)

### 3.1 Landing Page (one-page) — domínio principal

Estrutura da página única (exceto Blog, que é externo):

#### (A) Header / navegação superior
- **Esquerda:** logo CotaCondo
- **Direita (mesma altura), nesta ordem:**
  1. **Para Fornecedores** → LP dedicada (`/fornecedores` ou subdomínio)
  2. **Fazer cotação** → âncora/fluxo no domínio principal (persona solicitante)
  3. **Blog** → link externo
  4. **Acesse** → tela de login / área autenticada

#### (B) Banner rotativo (hero full-bleed)
- Ocupa toda a extensão lateral
- Carrossel com rolagem orgânica e tempo adequado
- Capacidade de até **10 imagens**
- Cada slide é **clicável** (links externos configuráveis)
- Master Admin deve poder cadastrar/editar slides (imagem, ordem, link, ativo)

#### (C) Bloco institucional
- **Esquerda:** mascote/robô da plataforma
- **Direita:** texto descritivo sobre a plataforma

#### (D) Planos lado a lado
- Cards de planos (Free / Pago / Premium conforme catálogo) exibidos em linha
- Botão **Cotar** / CTA de contratação:
  - Direciona para fluxo de acesso (login/cadastro)
  - Se o usuário escolher plano superior, vai para **página de contratação e confirmação do plano específico**
  - Integração com **gateway de pagamento** (trâmites padrão SaaS: checkout → pagamento → ativação da assinatura → liberação de features)

#### (E) Falar com um especialista
- CTA com **link direto para WhatsApp** (número configurável no Master Admin)

### 3.2 LP Para Fornecedores (campanhas / pixels)

- Mesma identidade visual do projeto
- Linguagem mais direta: benefícios para o fornecedor
- Exibição dos planos do fornecedor + contratação automatizada com gateway
- **Suporte a campanhas:**
  - Rota no domínio principal: `cotacondo.com.br/fornecedores`
  - Subdomínio opcional: `fornecedores.cotacondo.com.br` (mesmo app, rewrite/host)
  - Query params / UTM + slots para pixels de mídia (Meta, Google Ads, etc.) sem quebrar a LP principal
- Objetivo: isolar mensuração de aquisição da persona fornecedor

### 3.3 Identidade visual (marketing)
- Tipografia: **Poppins** (pesos regulares/médios/bold conforme hierarquia)
- Logo e mascote: assets oficiais do cliente
- Manter identidade consistente entre LP principal e LP Fornecedores
- Blueprint de engenharia front-end (liquid-glass, motion, anti-genérico): [`landing-prompt-cotacondo.md`](./landing-prompt-cotacondo.md)

---

## 4. Catálogo de Categorias e Serviços

> O **Master Admin da plataforma** pode **criar, alterar e excluir** categorias e serviços a qualquer momento. A listagem abaixo é o **seed oficial** (catálogo inicial).

Modelo: `ServiceCategory` → possui N `ServiceItem` (serviços).

Na abertura de cotação, o solicitante seleciona **categoria** e, quando aplicável, **serviço** específico.

### 🔵 1. Seguros — 7 itens
1. Incêndio (**obrigatório**)
2. Garantia de Aluguel
3. Proteção Unidade
4. Responsabilidade Civil
5. Pet
6. Veicular (garagem)
7. Vida em Grupo (funcionários)

### 🟢 2. Segurança e Portaria — 10 itens
1. Portaria Presencial 24h
2. Portaria Remota/Inteligente
3. Vigilância Patrimonial
4. CFTV/Câmeras
5. Alarme Monitorado
6. Controle de Acesso (biometria/facial/tag)
7. Interfonia
8. Cerca Elétrica
9. Sensor de Presença/Barreira Perimetral
10. Brigada de Incêndio (treinamento)

### 🟡 3. Manutenção Predial — 15 itens
1. Elevadores
2. Bombas (hidráulicas/incêndio)
3. Ar Condicionado (HVAC)
4. Elétrica
5. Hidráulica
6. Telhados e Coberturas
7. SPDA (Para-raios)
8. Portões Automáticos
9. Geradores
10. Extintores e Mangueiras
11. Gás (central/encanado)
12. Cisternas e Reservatórios
13. Piscinas
14. Playground/Brinquedos
15. Academia

### 🟠 4. Obras e Reformas — 10 itens
1. Impermeabilização de lajes
2. Pintura e Restauração de Fachada
3. Reforma de Hall e Áreas Comuns
4. Reforma de Garagem
5. Troca de Esquadrias
6. Reforma de Telhado
7. Reforma Hidráulica Geral
8. Reforma Elétrica Geral
9. Piso Tátil/Acessibilidade (NBR 9050)
10. Construção de Guarita/Portaria

### 🔴 5. Limpeza e Conservação — 11 itens
1. Limpeza Geral
2. Vidros e Fachadas
3. Pós-Obra
4. Caixa d'Água (**obrigatório semestral**)
5. Piscinas
6. Garagem
7. Lixeiras
8. Caixas de Gordura
9. Desentupimento
10. Tapetes e Carpetes
11. Forros e Sancas

### 🟣 6. Controle de Pragas — 6 itens
1. Dedetização
2. Desratização
3. Descupinização
4. Desinfecção/Sanitização
5. Morcegos e Pombos
6. Mosquitos (dengue)

### 🟤 7. Jardinagem e Paisagismo — 8 itens
1. Corte de Grama
2. Poda de Árvores/Arbustos
3. Plantio/Replantio
4. Projeto Paisagístico
5. Irrigação Automatizada
6. Adubação
7. Jardins Verticais
8. Hortas Comunitárias

### 🟠 8. Tecnologia e Automação — 8 itens
1. Wi-Fi Áreas Comuns
2. Antena Coletiva/TV
3. Automação de Iluminação (LED/sensor)
4. Software de Gestão
5. Aplicativo do Condomínio
6. Reconhecimento de Placas
7. Automação de Portaria (totem/QR)
8. Medição Individualizada de Água/Gás

### 🟢 9. Serviços Administrativos — 6 itens
1. Administradora
2. Contabilidade
3. Assessoria Jurídica
4. Cobrança Terceirizada
5. Correspondência/Encomendas
6. Digitalização de Documentos

### 🔵 10. Serviços Obrigatórios/Legais — 9 itens
1. AVCB/CLB (Corpo de Bombeiros)
2. Laudo de Inspeção Predial (NBR 16.747)
3. Laudo SPDA
4. Laudo de Gás
5. Laudo de Elevadores
6. Laudo de Carga de Incêndio
7. Atestado de Brigada
8. Certificado de Limpeza de Caixa d'Água
9. Alvará de Funcionamento

### 🟡 11. Materiais e Suprimentos — 8 itens
1. Materiais de Limpeza Profissional
2. Materiais de Manutenção (elétrica/hidráulica)
3. EPIs
4. Uniformes
5. Mobiliário para Áreas Comuns
6. Suprimentos de Jardinagem
7. Extintores e Sinalização
8. Produtos para Piscina

### 🟣 12. Serviços Especiais/Eventos — 5 itens
1. Salão de Festas/Churrasqueira
2. Buffet/Refeições
3. Segurança para Eventos
4. Locação de Equipamentos (som/telão/tenda)
5. Serviço de Mudanças

### 🔴 13. Facilities — 7 itens
1. Zeladoria
2. Recepção/Atendimento
3. Mensageiro/Office Boy
4. Lavanderia
5. Coleta de Resíduos Recicláveis
6. Descarte de Entulho (caçamba)
7. Higienização de Estofados

**Total seed:** 13 categorias · **110 serviços**.

Campos recomendados por item: `name`, `slug`, `is_mandatory` (ex.: Incêndio, Caixa d'Água), `periodicity_hint` (ex.: semestral), `is_active`, `sort_order`.

---

## 5. Módulos Funcionais (Plataforma SaaS)

### Módulo 1 — Acesso, Dashboards e Notificações

#### 1.1 Autenticação
- Cadastro, login e recuperação de senha
- Confirmação de cadastro em **duas etapas**
- Sessão segura com controle de perfil/plano

#### 1.2 Dashboards (KPIs iniciais)
- Quantidade de cotações abertas
- Propostas recebidas / enviadas
- Propostas aprovadas / recusadas
- Saldo de cotações do mês (franquia do plano)

#### 1.3 Central de Notificações
**Sino (tempo real)** — disparado em qualquer alteração de evento/status:
- Nova proposta, início/aceite de negociação
- Alteração de status da cotação
- Aprovação/recusa
- Atualização de compliance documental
- Entrada de novas comissões (somente Master)

**E-mail estratégico:**
- Meta mínima de propostas atingida → e-mail automático ao solicitante

**Ciclo de lembretes recorrentes:**
| Destinatário | Regra | Pausa quando |
|--------------|-------|--------------|
| Solicitante | Alertas aos **5 e 10 dias** se cotação aberta/sem escolha | Aprova proposta ou seleciona "Outros" |
| Fornecedor | Lembretes contínuos após convite | Envia proposta **ou** Declina oportunidade |

---

### Módulo 2 — Condomínios e Abertura de Cotações

#### 2.1 Cadastro de condomínios (Síndico / Administradora)
- Manual: Nome, Endereço, CNPJ, Contato
- Importação em lote: CSV / XLS

#### 2.2 Nova cotação
Campos:
- Seleção da **Categoria** e do **Serviço** (catálogo Master Admin)
- Nível de urgência
- Descrição detalhada
- Upload de anexos
- **Propostas mínimas** (gatilho de notificação ao atingir)
- **Propostas máximas** (pausa recebimento ao atingir)

Regras:
- ID único automático
- Validação de franquia mensal **antes** da criação
- Travamento visual do botão de criar ao atingir limite
- Serviços marcados como obrigatórios/semestrais devem ser sinalizados na UI

---

### Módulo 3 — Planos dos Solicitantes, Migração e Parcerias

#### 3.1 Franquia de cotações
- Padrão Free: **15 cotações/mês** (parametrizável global ou por cliente pelo Master Admin)
- Planos pagos: limite expandido / ilimitado conforme contrato

#### 3.2 Matriz de recursos

| Recurso | Síndico Free | Síndico Pago | Adm Free | Adm Premium |
|---------|--------------|--------------|----------|-------------|
| Franquia mensal | 15* | Ampliado | 15* | Ampliado / Ilimitado |
| Exportação Whitelabel | Sem logo | Com logo | Com logo | Com logo |
| Favoritar fornecedores | ❌ | ❌ | ❌ | ✅ |
| Gestão de parcerias | ❌ | ❌ | ❌ | ✅ |
| Comissionamento / receita | ❌ | ❌ | ❌ | 🔒 só Master |
| Métricas SLA / tempo médio | ❌ | ❌ | ❌ | ✅ |

\* Parametrizável pelo Master Admin.

> Whitelabel Free: por padrão sem logo, mas o gestor da plataforma pode liberar em negociação especial.

#### 3.3 Migração e upgrades/downgrades
- **Síndico → Administradora:** exige obrigatoriamente plano pago intermediário ou superior da Administradora (bloqueia migração para Adm Free)
- Preserva histórico: condomínios, cotações, propostas, fornecedores, documentos
- **Upgrade:** imediato após confirmação de pagamento
- **Downgrade:** vigora no fim do ciclo; aplica travas se recursos excederem o novo plano

#### 3.4 Parcerias e comissionamento (Adm Premium — só Master)
- **Growth Loop / Trava:** só vincula parceiro se fornecedor estiver no Plano Intermediário+ (trava configurável pelo Master Admin da plataforma)
- Volume financeiro por fornecedor (filtros: gerente, período, categoria)
- Acordo: valor fixo ($) ou percentual (%); recorrência 1–12 meses ou recorrente
- Extrato mensal de receitas/comissões por parceiro

#### 3.5 Analytics e SLA (Adm Premium)
**Equipe (operacional + master):**
- SLA por proposta (tempo convite → envio)
- Tempo médio de finalização do ciclo
- Gráfico de categorias mais solicitadas

**Somente Master:**
- Ranking financeiro de parceiros
- Projeção de receita futura
- Exportação CSV/Excel

---

### Módulo 4 — Planos do Fornecedor e CRM

| Recurso | Free | Intermediário (Pro) | Avançado (Premium + CRM) |
|---------|------|---------------------|--------------------------|
| Limite cotações internas | 1/mês* | XX/mês* | Ilimitado / YY* |
| Categorias inclusas | 1 (vinculada ao CNPJ) | Até 3 | Múltiplas |
| Categorias adicionais | ❌ | Cobrança extra | Cobrança por pacote |
| Habilita parceria Adm | ❌ | ✅ | ✅ |
| CRM externo | ❌ | ❌ | ✅ |

\* Parametrizável pelo Master Admin.

#### CRM externo (Premium)
- Pipeline Kanban de leads externos (fora do CotaCondo)
- Prospects, histórico de propostas, anexos, funil de vendas

---

### Módulo 5 — Fornecedor: Compliance e Propostas

#### 5.1 Compliance semestral
- Envio/renovação obrigatória de certidões e documentos
- Status: 🟢 Aprovado | 🟡 Em Análise | 🔴 Em Atraso | 🔴 Negada

#### 5.2 Painel de oportunidades
- Listagem com filtros (Categoria, Status, ID)
- Ação obrigatória: **Enviar Proposta** ou **Declinar Oportunidade**
- Kanban: Pendentes | Em Andamento | Enviadas | Em Negociação | Aprovadas | Recusadas

#### 5.3 Envio de propostas
- Múltiplas condições comerciais na mesma cotação (ex.: à vista, parcelado, com insumos)
- Por condição: Valor ($), Condição de pagamento, Anexo exclusivo

---

### Módulo 6 — Comparativo, Negociação e Aprovação

#### 6.1 Comparativo Whitelabel
- Tabela comparativa (condições, valores, anexos)
- Exportação PDF com logo do solicitante + assinatura **"by CotaCondo"**
- Free: sem whitelabel (exceto liberação especial pelo Master Admin)

#### 6.2 Três caminhos de finalização
1. **Negociar** — canal de contrapropostas; status → Em Negociação; notifica fornecedor(es)
2. **Aprovar (Plataforma)** — proposta escolhida aprovada; demais recusadas; alimenta auditoria e comissionamento
3. **Aprovação Outros (externa)** — campos obrigatórios: Nome da empresa + Valor final
   - Status → Finalizada - Outros
   - Notifica fornecedores participantes
   - Encerra lembretes do solicitante
   - Dados ficam no histórico interno para auditoria

---

### Módulo 7 — Motor de Distribuição Inteligente

Distribuição automática até atingir **Propostas Máximas**:

| Prioridade | Grupo | Condições |
|------------|-------|-----------|
| 1ª | Favoritos da Administradora | Favoritos + categoria + saldo de cotações no plano pago |
| 2ª | Pagantes + Compliant | Plano Pro/Premium + categoria + docs aprovados (seleção aleatória) |
| 3ª | Pagantes com pendência | Plano pago + categoria + docs Em Análise/Atraso (se faltarem propostas) |
| 4ª | Plano Free | Categoria do CNPJ + trava de 1 cotação/mês (fallback) |

---

### Módulo 8 — Indicação e Growth

- Link unificado de indicação para todos os perfis
- Rastreamento automático de cadastros originados
- Painel: lista de indicados, status (Free / Ativo Pago), cashback/comissão acumulada, histórico de resgates

---

### Módulo 9 — Painel Master Admin (Plataforma)

- Aprovação/gestão de migrações Síndico → Administradora
- Liberação de recursos em negociação especial
- Histórico de planos e cálculo pró-rata
- Franquia Free global e override por cliente
- Parametrização XX/YY de cotações dos planos de fornecedor
- Mensalidades e cobrança escalável por categorias adicionais
- Prazos de lembretes (padrão 5 e 10 dias)
- Auditoria/aprovação de compliance documental
- Relatórios globais: conversão de planos, indicações, volume, métricas "Outros"
- Toggle da trava de parceria (fornecedor Free vs pago)
- **CRUD de categorias e serviços** do catálogo (seed de 13 categorias / 110 serviços)
- **Gestão de banners** da landing (até 10 slides: imagem, ordem, link externo, ativo)
- **WhatsApp** do CTA "Falar com um especialista"
- Configuração de **pixels/UTM** e hosts da LP Fornecedores

---

### Módulo 10 — Homologação e Requisitos Não Funcionais

#### Segurança e LGPD
- Controle de acesso por perfil e plano
- Isolamento de dados financeiros (Master vs Operacional)
- Auditoria de ações sensíveis
- Formalização de testes contra invasão e acessos indevidos
- Conformidade LGPD (minimização, consentimento, retenção, exclusão)

#### Escalabilidade e integrações
- Arquitetura preparada para conexão via **APIs** com ERPs
- Gateway de pagamento integrado no fluxo SaaS de contratação de planos (interface pluggable, sem amarrar a um único provedor)
- Sem amarrar a um ERP específico
- Dados e auth no **Firebase** (Firestore, Auth, Storage, Cloud Functions)

#### Homologação E2E obrigatória
Simular: visita LP → escolha de plano → checkout/gateway → indicação → abertura com categoria/serviço e metas → migração Síndico→Adm Intermediária → propostas → negociação → aprovação interna ou Outros → Whitelabel → comissionamento só no Master → LP Fornecedores com UTM/pixel.

---

## 6. Stack Tecnológica Recomendada

> Definida para atender SaaS multi-tenant, site marketing, tempo real, LGPD e extensibilidade via API.  
> **BaaS oficial: Firebase** (projeto `marcio-ab7d9`) — **não** usamos Supabase.

| Camada | Tecnologia |
|--------|------------|
| Frontend Web | Next.js (App Router) + TypeScript + Tailwind CSS |
| Tipografia | **Poppins** (Google Fonts / self-host) |
| Backend / API | Next.js Route Handlers / Server Actions + Node.js |
| Validação | Zod (edge de entrada) |
| BaaS / Projeto | **Firebase** — `marcio-ab7d9` |
| Banco de dados | **Cloud Firestore** |
| Auth | **Firebase Authentication** (e-mail/senha + confirmação em duas etapas) |
| Storage | **Firebase Storage** (anexos, documentos, logos, banners) |
| Analytics | **Google Analytics via Firebase** (`measurementId`) |
| Notificações tempo real | Firestore listeners / Cloud Functions + fila de e-mail |
| Jobs / Lembretes | Cloud Functions + Cloud Scheduler (ou fila equivalente) |
| PDF Whitelabel | Geração server-side (ex.: React-PDF / Puppeteer) |
| Pagamentos | Gateway pluggable (Stripe/Asaas/Pagar.me etc. via `PaymentProvider`) |
| Marketing / pixels | UTM + snippets configuráveis (Meta/Google) na LP Fornecedores |
| Hospedagem | Vercel / Firebase Hosting + DNS (domínio + subdomínio fornecedores) |
| Segurança de dados | **Firestore Security Rules** + Storage Rules (isolamento por organização) |
| Repositório | Git (GitHub/GitLab) com CI, branch protection e secrets |

### Firebase — variáveis de ambiente

Configuração no `.env` (nunca commitar secrets de service account; web config é `NEXT_PUBLIC_*`):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

Cliente tipado: `src/lib/firebase/client.ts`.

### Princípios de arquitetura
- Separação Domain / Application / Infrastructure / Presentation
- Multi-tenant com isolamento por organização (**Firestore Security Rules**)
- Feature flags por plano e overrides do Master Admin
- Event-driven para notificações e motor de distribuição (Cloud Functions)
- APIs versionadas para futuras integrações ERP/pagamento
- Rotas públicas (marketing) separadas da área autenticada (`/app`)

---

## 7. Modelo de Dados (Entidades Principais)

> Persistência alvo: **collections no Cloud Firestore** (nomes em camelCase/snake conforme implementação). O schema Prisma do Dia 1 serve apenas como **referência de domínio** durante o bootstrap.

```
User
Organization (Síndico | Administradora | Fornecedor)
OrganizationMember (role: master | operational)
Plan / Subscription / PlanOverride / CheckoutSession
Condominium
ServiceCategory
ServiceItem (obrigatório?, periodicidade?, ativo, ordem)
Quotation (category_id, service_item_id, metas min/max, urgência, status, franchise_consumed)
QuotationAttachment
QuotationInvite (fornecedor, status, prioridade distribuição)
Proposal (múltiplas ProposalCondition)
NegotiationMessage
ComplianceDocument (status, validade semestral)
Partnership / CommissionAgreement / CommissionLedger
ReferralLink / Referral / CashbackLedger
Notification / ReminderSchedule
FavoriteSupplier (Adm Premium)
CrmLead / CrmDeal (Fornecedor Premium)
LandingBanner (imagem, link externo, ordem, ativo) — até 10
MarketingSettings (whatsapp_url, pixel_scripts, supplier_lp_host)
AuditLog
PlatformSettings (franquias, prazos lembretes, toggles)
BrandAsset (logo, mascote)
```

### Status principais de Cotação
`rascunho` → `aberta` → `em_negociacao` → `aprovada` | `finalizada_outros` | `cancelada` | `expirada`

### Status de Proposta
`enviada` → `em_negociacao` → `aprovada` | `recusada` | `substituida`

### Status de Checkout / Assinatura
`pending` → `paid` → `active` | `failed` | `canceled` | `past_due`

---

## 8. Regras de Negócio Críticas (Checklist)

1. Franquia mensal validada **antes** de criar cotação
2. Meta mínima dispara e-mail/sino; máxima pausa novas propostas
3. Lembretes 5/10 dias para solicitante; contínuos para fornecedor até ação definitiva
4. Declinar oportunidade encerra lembretes daquele convite
5. Migração Síndico→Adm **bloqueia** plano Free
6. Operacional da Adm **não vê** financeiro/comissões
7. Parceria só com fornecedor Intermediário+ (toggle Master Admin)
8. Distribuição respeita prioridade Favoritos → Compliant → Pendentes → Free
9. Aprovar plataforma: 1 aprovada + demais recusadas + alimenta comissão
10. "Outros" exige nome + valor; encerra ciclo e registra auditoria
11. Whitelabel Free bloqueado (exceto override Master)
12. Compliance semestral impacta elegibilidade na distribuição
13. Upgrade imediato; downgrade no fim do ciclo com travas
14. Indicação rastreável com painel de cashback/comissão
15. CTA de plano na LP leva a login/cadastro + checkout do **plano específico** via gateway
16. Catálogo de categorias/serviços é CRUD do Master Admin (seed inicial obrigatório)
17. Banner da LP: máximo 10 slides clicáveis com links externos
18. Blog permanece **externo** (apenas link no menu)
19. LP Fornecedores aceita UTM/pixel e pode rodar em path ou subdomínio

---

## 9. Escopo Fora / Evoluções Futuras

- App mobile nativo (hoje focado em web responsiva)
- Blog hospedado dentro do CotaCondo (permanece externo nesta versão)
- Integrações ERP concretas (arquitetura API-ready)
- Chat avançado além do canal de negociação
- Marketplace público aberto
- Mapa mental interativo das categorias (referência do cliente; UI pode ser árvore/accordion no MVP)

---

## 10. Critérios de Aceite Globais

- [ ] Landing one-page com header, banner (≤10), robô+texto, planos, WhatsApp
- [ ] LP Fornecedores com copy própria, planos e checkout
- [ ] Checkout SaaS de plano integrado ao gateway (confirmação → ativação)
- [ ] Catálogo seed (13 categorias / 110 serviços) + CRUD Master Admin
- [ ] Todos os perfis autenticam e veem menu/dashboard corretos
- [ ] Fluxo E2E de cotação funciona 100% dentro da plataforma
- [ ] Travas de plano, franquia, migração e permissão financeiro validadas
- [ ] Notificações (sino + e-mail + lembretes) operacionais
- [ ] Motor de distribuição respeita prioridades e limites
- [ ] Whitelabel, Outros, comissionamento e indicação auditáveis
- [ ] Testes de segurança e LGPD documentados e executados
- [ ] Código versionado, ambiente de homologação disponível

---

## 11. Plano de Entrega (7 Dias)

Documentos detalhados por dia:

| Dia | Arquivo | Foco |
|-----|---------|------|
| 1 | [dia-01.md](./dia-01.md) | Fundação, auth, perfis, schema, brand (Poppins/logo/mascote) |
| 2 | [dia-02.md](./dia-02.md) | Catálogo categorias/serviços, condomínios, cotações, franquia |
| 3 | [dia-03.md](./dia-03.md) | Fornecedor: compliance, oportunidades, propostas |
| 4 | [dia-04.md](./dia-04.md) | Distribuição, comparativo, negociação, aprovação |
| 5 | [dia-05.md](./dia-05.md) | Planos, checkout/gateway, migração, parcerias, comissionamento |
| 6 | [dia-06.md](./dia-06.md) | Notificações, indicação, Master Admin (banners, WhatsApp, catálogo) |
| 7 | [dia-07.md](./dia-07.md) | Landing + LP Fornecedores, analytics, CRM, Whitelabel, E2E |

### Evidências diárias (prints)

Cada dia **só fecha** com prints na pasta correspondente:

- Protocolo: [`evidencias/README.md`](./evidencias/README.md)
- Pastas: `doc/evidencias/dia-01` … `doc/evidencias/dia-07`
- Checklist de arquivos: seção **“Evidências / Prints para o cliente”** em cada `dia-0X.md`

Regra: o cliente deve conseguir **ver na tela** o que avançou naquele dia (sem depender só de código ou logs).

---

## 12. Glossário

| Termo | Significado |
|-------|-------------|
| Solicitante | Síndico ou Administradora que abre cotação |
| Franquia | Limite mensal de cotações do plano |
| Whitelabel | PDF comparativo com logo do solicitante |
| Outros | Contratação externa à plataforma |
| Growth Loop | Ciclo em que parceiros impulsionam upgrades mútuos |
| Compliance | Validação documental semestral do fornecedor |
| Master Admin | Dono/gestor da plataforma CotaCondo |
| Master Adm | Usuário master **da** Administradora (cliente) |
| Landing / One-page | Site público institucional no domínio principal |
| LP Fornecedores | Página de conversão da persona fornecedor (+ campanhas/pixel) |
| ServiceItem | Serviço dentro de uma categoria do catálogo |
| Checkout SaaS | Contratação/confirmação de plano via gateway de pagamento |

---

*Documento gerado a partir do escopo oficial: "Cota Condo Dev Versão 2" + briefing de Site/Landing e catálogo de categorias.*  
*BaaS: **Firebase** (`marcio-ab7d9`) — Auth, Firestore, Storage, Analytics.*  
*Última atualização: 24/07/2026.*
