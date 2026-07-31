# Dia 7 — Landing Page, LP Fornecedores, Analytics, CRM, Whitelabel e Homologação E2E

**Objetivo do dia:** entregar o site público (one-page + LP fornecedores), fechar módulos avançados e homologar o fluxo completo.

**Módulos cobertos:** Site (A–E), 3.5, 4.2, 6.1 (Whitelabel), 10.

---

## 1. Landing Page one-page (domínio principal)

### Header (A)
- [x] Logo à esquerda (asset oficial)
- [x] Menu na mesma altura, nesta ordem:
  1. Para Fornecedores → `/fornecedores` (ou subdomínio)
  2. Fazer cotação → âncora/seção da persona solicitante
  3. Blog → link externo (configurável)
  4. Acesse → login / área autenticada
- [x] Fonte **Poppins** em toda a página

### Banner rotativo (B)
- [x] Full-bleed / toda extensão lateral
- [x] Até 10 slides vindos do Master Admin
- [x] Autoplay com intervalo orgânico + pause on hover
- [x] Slides clicáveis (links externos)
- [x] Indicadores / setas acessíveis

### Bloco institucional (C)
- [x] Esquerda: mascote/robô *(no hero dual-column conforme blueprint)*
- [x] Direita: texto sobre a plataforma *(copy + CTAs no hero)*

### Planos (D)
- [x] Cards lado a lado (responsive: stack no mobile)
- [x] Botão Cotar / Contratar:
  - Free → cadastro/login
  - Planos pagos → login/cadastro + **checkout do plano específico** (Dia 5)
- [x] Destaque visual do plano recomendado (se houver)

### WhatsApp (E)
- [x] CTA "Falar com um especialista" → link `wa.me` configurável

## 2. LP Para Fornecedores (campanhas)

- [x] Página `/fornecedores` com mesma identidade visual
- [x] Copy direta de benefícios + planos do fornecedor
- [x] CTAs de contratação com gateway (plano Pro/Premium)
- [ ] Suporte a subdomínio `fornecedores.cotacondo.com.br` (rewrite por host)
- [x] Captura de UTM na sessão/cadastro
- [x] Slot configurável para pixels (Meta/Google) sem poluir a LP principal
- [x] Responsivo e consistente com Poppins/logo/mascote

## 3. Analytics, SLA e BI (Adm Premium — Módulo 3.5)

### Visíveis à equipe (Operacional + Master)
- [ ] SLA por proposta: tempo convite → submissão
- [ ] Tempo médio de finalização (abertura → encerramento)
- [ ] Gráfico de categorias/serviços mais solicitados por período

### Exclusivos do Master da Administradora
- [ ] Ranking financeiro das empresas parceiras
- [ ] Projeção de receita futura com base nos comissionamentos
- [ ] Exportação financeira CSV e Excel
- [ ] Guards de permissão em API e UI

## 4. CRM externo do Fornecedor Premium (Módulo 4.2)

- [ ] Pipeline Kanban de leads externos
- [ ] Cadastro de prospects
- [ ] Histórico de propostas externas + anexos
- [ ] Funil básico de vendas
- [ ] Bloqueio total para planos Free/Pro (PlanGate)

## 5. Exportação Whitelabel do comparativo (Módulo 6.1)

- [ ] PDF do quadro comparativo
- [ ] Logo do solicitante quando plano permitir
- [ ] Assinatura obrigatória **"by CotaCondo"**
- [ ] Free: bloquear whitelabel — exceto override Master Admin
- [ ] Download a partir da tela de comparativo

## 6. Ajustes de UI/UX (Módulo 10)

- [ ] Revisar fluxos críticos do app + landing
- [ ] Travamento visual consistente de botões por plano/franquia
- [ ] Empty states e mensagens de trava
- [ ] Responsividade mobile (LP + app)
- [ ] Polimento de dashboards e Kanbans

## 7. Segurança, LGPD e testes formais

- [ ] Checklist de segurança (authz, multi-tenant, upload, secrets, rate limit)
- [ ] LGPD (consentimento, minimização, auditoria, exclusão/anonimização)
- [ ] Testes automatizados prioritários:
  - Migração bloqueia Adm Free
  - Operacional sem acesso financeiro
  - Franquia global vs override
  - Declinar pausa lembretes
  - Lembretes 5/10 e parada pós aprovação/Outros
  - Motor de distribuição (prioridades)
  - Checkout libera plano só após webhook pago
  - Banner máximo 10 slides
- [ ] Documentar evidências dos testes

## 8. Homologação End-to-End (script obrigatório)

1. [ ] Visitante abre LP principal (Poppins, logo, banner, robô, planos, WhatsApp)
2. [ ] Clica plano pago → login/cadastro → checkout gateway → assinatura ativa
3. [ ] Visita LP Fornecedores com UTM → contrata plano Pro
4. [ ] Usuário A indica Usuário B via link
5. [ ] Síndico abre cotação com **categoria + serviço** do catálogo, metas e anexos
6. [ ] Motor distribui fornecedores na ordem correta
7. [ ] Fornecedores: 1 declina, 2 enviam propostas (múltiplas condições)
8. [ ] Meta mínima gera e-mail/sino
9. [ ] Negociação → aprovação interna **ou** "Outros"
10. [ ] Exportação Whitelabel (conta elegível)
11. [ ] Migração Síndico → Administradora Intermediária (bloquear Free)
12. [ ] Master da Adm vê comissionamento; Operacional não vê
13. [ ] Master Admin edita banner, WhatsApp e uma categoria do catálogo
14. [ ] Relatórios globais refletem a simulação

## 9. Entregáveis finais do sprint

- [ ] Build de homologação estável (site + app)
- [ ] Relatório E2E preenchido
- [ ] Documentação atualizada (`documentation.md` + dias 1–7)
- [ ] Lista de débitos técnicos priorizados (pós-sprint)
- [ ] Demo para o cliente cobrindo LP + SaaS
- [ ] **Pasta `doc/evidencias/dia-07/` preenchida** com os prints abaixo (+ pacote consolidado da semana se pedido)

## Evidências / Prints para o cliente

> Obrigatório. Sem esses prints o dia não fecha. Salvar em `doc/evidencias/dia-07/`.

| # | Arquivo sugerido | O que mostrar na tela |
|---|------------------|------------------------|
| 01 | `01-lp-hero-desktop.png` | Landing hero (logo, nav, mascote, copy, CTAs) |
| 02 | `02-lp-banner.png` | Banner rotativo full-bleed |
| 03 | `03-lp-planos.png` | Seção de planos lado a lado |
| 04 | `04-lp-whatsapp.png` | CTA Falar com especialista |
| 05 | `05-lp-mobile.png` | Landing no mobile (nav drawer + stack) |
| 06 | `06-lp-fornecedores.png` | LP `/fornecedores` com planos e copy própria |
| 07 | `07-analytics-sla.png` | Dashboard SLA / tempo médio / categorias |
| 08 | `08-analytics-financeiro-master.png` | Ranking/projeção (só Master Adm) |
| 09 | `09-crm-kanban.png` | CRM Premium do fornecedor |
| 10 | `10-whitelabel-pdf.png` | PDF comparativo aberto (logo + “by CotaCondo”) |
| 11 | `11-e2e-fluxo-completo.png` | Collage ou sequência: cotação → proposta → aprovação |
| 12 | `12-operacional-vs-master.png` | Side-by-side: Operacional sem financeiro / Master com |

## Critérios de aceite do Dia 7 / Sprint

1. One-page atende estrutura A–E do briefing.
2. LP Fornecedores conversível com planos + checkout + UTM/pixel.
3. Roteiro E2E executado com evidências.
4. Whitelabel gera PDF com "by CotaCondo" e regras de logo corretas.
5. Analytics/CRM Premium respeitam PlanGate.
6. Nenhum vazamento de dados financeiros para Operacional.

## Débitos aceitáveis pós-Dia 7 (se necessário)

- Integração ERP concreta
- App mobile nativo
- Blog hospedado internamente (permanece externo)
- Polimento avançado de BI
- Automação completa de cashback/pagamento de indicação
- Mapa mental interativo das categorias (alternativa: listagem/accordion)

> Gateway: se o provedor oficial do cliente atrasar, manter sandbox funcional + interface pluggable e registrar no handoff.
> Tudo o que ficar de fora deve estar listado explicitamente no handoff para o cliente.
