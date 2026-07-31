# Dia 5 — Planos, Checkout/Gateway, Migração, Parcerias e Comissionamento

**Objetivo do dia:** implementar a camada comercial SaaS — planos, checkout com gateway, upgrades/downgrades, migração e financeiro da Administradora Premium.

**Módulos cobertos:** 3.1–3.4, 4.1 (fechamento), Site (D — contratação de plano), 9 (parcial).

**Status:** implementação funcional **100% OK** (`PlanGate`, sandbox gateway, checkout deep-link, upgrade/downgrade, migração com bloqueio Free, parcerias+trava, comissões Master, addon categorias; `smoke:dia-05`). Faltam os **12 prints** em `doc/evidencias/dia-05/`.

---

## 1. Arquitetura de planos (Solicitantes e Fornecedores)

- [x] Catálogo de planos versionado no banco (Free / Pago / Premium + Free / Pro / Premium Fornecedor + `adm-pago`)
- [x] Feature matrix por plano (whitelabel, favoritos, parcerias, CRM, SLA, etc.)
- [x] Serviço `PlanGate` centralizando checagens (`can(feature)`, `getQuota()`)
- [x] Overrides individuais por cliente (franquia e flags)
- [x] Parametrização global: franquia Free padrão = 15; XX/YY fornecedor
- [x] Preços e ciclo de cobrança (mensal) por plano

## 2. Checkout SaaS + Gateway de pagamento (obrigatório para plano superior)

- [x] Interface `PaymentProvider` (pluggable: Stripe/Asaas/Pagar.me/etc.)
- [x] Fluxo padrão SaaS:
  1. Usuário escolhe plano (LP ou área logada)
  2. Login/cadastro se necessário
  3. Página de **contratação e confirmação do plano específico**
  4. Pagamento no gateway
  5. Webhook confirma → assinatura `active` → features liberadas
- [x] Deep-link com `planId` / `planSlug` (ex.: `/checkout?plan=adm-premium`)
- [x] Tratamento de falha, cancelamento e `past_due`
- [x] Ambiente sandbox do gateway documentado no `.env.example`
- [x] Idempotência de webhooks + `audit_logs`

## 3. Upgrades e Downgrades

- [x] Upgrade: confirmação de pagamento → liberação **imediata**
- [x] Downgrade: solicita → efetiva no **fim do ciclo**
- [x] Travas de readaptação no downgrade (categorias/recursos excedentes)
- [x] Histórico de mudanças de plano + cálculo pró-rata (linear pelo restante do ciclo)
- [x] Free → Pago usa o mesmo checkout (sem cobrança se Free)

## 4. Migração Síndico → Administradora (Módulo 3.3)

- [x] Solicitação de migração de perfil
- [x] **Trava:** bloquear migração para Administradora Free
- [x] Exigir plano pago intermediário+ da Administradora (via checkout)
- [x] Preservar e reestruturar dados (condomínios, cotações, propostas, docs, fornecedores)
- [x] Painel Master Admin: aprovar/rejeitar (ou auto se pagamento ok)
- [x] Testes automatizados do bloqueio Free e da preservação de histórico

## 5. Gestão de parcerias (Adm Premium)

- [x] Vincular fornecedor parceiro à Administradora
- [x] **Growth Loop / Trava:** só permite se fornecedor ≥ Intermediário
- [x] Mensagem padrão quando fornecedor é Free (texto do escopo)
- [x] Toggle Master Admin da plataforma: habilitar/desabilitar a trava
- [x] Listagem de parceiros com status do plano do fornecedor

## 6. Comissionamento e receita (só Usuário Master da Adm)

- [x] Guards: Operacional **não acessa** rotas/UI financeiras
- [x] Cadastro de acordo após aceite de contrato (fixo $ ou %; 1–12 meses ou recorrente)
- [x] Volume financeiro por fornecedor (filtros: gerente, período, categoria)
- [x] Ledger de comissões / expectativa de receita
- [x] Extrato mensal por parceiro
- [x] Hook pós `quotation.approved` alimentando volumes

## 7. Categorias adicionais do fornecedor (cobrança escalável)

- [x] Modelo: item adicional com preço unitário × quantidade
- [x] Checkout/addon reutilizando o `PaymentProvider`
- [x] UI de solicitação/contratação de categorias extras (Pro/Premium)

## 8. Entregáveis do dia

- [x] PlanGate bloqueia features conforme matriz do escopo
- [x] Checkout de plano pago funciona em sandbox (LP → confirmação → webhook → ativo)
- [x] Migração Síndico→Adm Free é impossível
- [x] Master da Adm cadastra comissão; Operacional recebe 403/hidden
- [x] Parceria bloqueada para fornecedor Free (se trava ativa)
- [ ] **Pasta `doc/evidencias/dia-05/` preenchida** com os prints abaixo

### Smoke

```bash
npm run db:setup
npm run smoke:dia-05
```

## Evidências / Prints para o cliente

> Obrigatório. Sem esses prints o dia não fecha. Salvar em `doc/evidencias/dia-05/`.

| # | Arquivo sugerido | O que mostrar na tela |
|---|------------------|------------------------|
| 01 | `01-catalogo-planos.png` | Tela/listagem de planos (solicitante e/ou fornecedor) |
| 02 | `02-checkout-plano-especifico.png` | Página de contratação do plano escolhido (nome/preço claros) |
| 03 | `03-gateway-pagamento.png` | Tela do gateway sandbox (ou embed) no fluxo |
| 04 | `04-assinatura-ativa.png` | Conta com plano pago ativo pós-pagamento |
| 05 | `05-upgrade-features.png` | Feature liberada imediatamente após upgrade |
| 06 | `06-migracao-bloqueio-free.png` | Tentativa Síndico→Adm Free bloqueada com mensagem |
| 07 | `07-migracao-pago-ok.png` | Fluxo de migração com plano intermediário+ |
| 08 | `08-parcerias-lista.png` | Gestão de parcerias (Adm Premium) |
| 09 | `09-trava-fornecedor-free.png` | Aviso ao tentar vincular fornecedor Free |
| 10 | `10-comissao-master.png` | Cadastro/extrato de comissão (usuário Master da Adm) |
| 11 | `11-operacional-sem-financeiro.png` | Mesma conta Operacional: menu/rota financeira ocultos ou 403 |
| 12 | `12-addon-categoria-extra.png` | UI de categoria adicional com preço × quantidade |

## Critérios de aceite

1. CTA de plano superior leva ao checkout do plano correto (não genérico). ✅
2. Assinatura só libera features após confirmação do gateway. ✅
3. Upgrade imediato; downgrade só no próximo ciclo. ✅
4. Migração preserva 100% do histórico listável no novo painel. ✅
5. Operacional não vê comissões nem por URL direta. ✅

## Dependências / riscos

- Gateway sandbox local (`PAYMENT_PROVIDER=sandbox`); Stripe/Asaas/Pagar.me via interface pluggable.
- LP visual completa fica no Dia 7; hoje o checkout funciona via `/checkout?plan=...` e Meu Plano.
- "Após aceite do contrato" para comissão: aprovação de cotação alimenta o ledger (MVP).
