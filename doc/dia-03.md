# Dia 3 — Fornecedor: Compliance, Oportunidades e Propostas

**Objetivo do dia:** habilitar o lado do fornecedor — documentos, painel de oportunidades e envio de propostas com múltiplas condições.

**Módulos cobertos:** 4.1 (estrutura base), 5.1, 5.2, 5.3.

**Status:** implementação funcional **100% OK** (Meu Plano, compliance, Kanban, propostas multi-condição, franquia Free, KPIs; `smoke:dia-03` idempotente). Deploy app na Vercel; Firebase Spark só rules/Storage. Faltam os **11 prints** em `doc/evidencias/dia-03/`.

---

## 1. Perfil e plano do fornecedor

- [x] Onboarding do fornecedor: dados da empresa, CNPJ, categoria(s) inicial(is) do catálogo oficial
- [x] Aplicar plano Free padrão (1 cotação/mês, 1 categoria)
- [x] Estrutura de assinatura pronta para Intermediário/Premium (flags, limites XX/YY)
- [x] Tela de "Meu Plano" (somente leitura + CTA upgrade → checkout Dia 5)
- [x] Regra: categorias inclusas vs adicionais (modelo de cobrança escalável)

## 2. Central de documentação / Compliance (Módulo 5.1)

- [x] Upload de certidões/documentos com validade semestral
- [x] Status: `aprovado` | `em_analise` | `em_atraso` | `negada`
- [x] Job/cron simples que marca `em_atraso` quando vencer (`jobs:compliance-expire` + lazy no load)
- [x] Histórico de envios e renovações
- [x] Notificação de domínio `compliance.updated` (consumo no Dia 6)
- [x] Painel Master Admin mínimo: fila de aprovação/rejeição (UI pode ser polida no Dia 6)

## 3. Painel de oportunidades (Módulo 5.2)

- [x] Listagem de convites/cotações recebidas
- [x] Filtros: Categoria, Status, ID
- [x] Expansão de detalhes (descrição, anexos do solicitante, urgência, prazo)
- [x] Ações obrigatórias:
  1. Aceitar e enviar proposta
  2. Declinar oportunidade
- [x] Declinar: registra motivo opcional + encerra lembretes daquele convite (hook para Dia 6)
- [x] Kanban visual: Pendentes | Em Andamento | Enviadas | Em Negociação | Aprovadas | Recusadas

## 4. Envio de propostas (Módulo 5.3)

- [x] Formulário de proposta vinculado a um convite
- [x] Suporte a **múltiplas condições** na mesma cotação:
  - Valor ($)
  - Condição de pagamento
  - Anexo exclusivo por condição
- [x] Validação: ao menos 1 condição; valores > 0
- [x] Status da proposta → `enviada`
- [x] Atualiza Kanban e contadores da cotação (propostas recebidas)
- [x] Evento `proposal.submitted` (meta mínima/máxima no Dia 4/6)

## 5. Controles de plano do fornecedor

- [x] Validar saldo de "cotações internas" do plano antes de aceitar/enviar
- [x] Free: máximo 1/mês (parametrizável)
- [x] Bloquear categorias fora do pacote contratado
- [x] Mensagens claras quando bloqueado por plano/compliance

## 6. Dashboard do fornecedor

- [x] KPIs: propostas enviadas, aprovadas, recusadas, saldo do mês
- [x] Atalhos: oportunidades pendentes, docs em atraso

## 7. Entregáveis do dia

- [x] Fornecedor envia documentos e vê status de compliance
- [x] Master Admin consegue aprovar/rejeitar documento
- [x] Fornecedor declina ou envia proposta com N condições
- [x] Kanban reflete o status corretamente
- [ ] **Pasta `doc/evidencias/dia-03/` preenchida** com os prints abaixo

### Smoke

```bash
npm run db:setup
npm run smoke:dia-03
```

## Evidências / Prints para o cliente

> Obrigatório. Sem esses prints o dia não fecha. Salvar em `doc/evidencias/dia-03/`.

| # | Arquivo sugerido | O que mostrar na tela |
|---|------------------|------------------------|
| 01 | `01-meu-plano-fornecedor.png` | Tela “Meu Plano” do fornecedor (Free + limites) |
| 02 | `02-compliance-upload.png` | Central de documentos com upload |
| 03 | `03-compliance-status.png` | Status Em Análise / Aprovado / Em Atraso / Negada |
| 04 | `04-master-aprova-doc.png` | Master Admin aprovando/rejeitando documento |
| 05 | `05-oportunidades-lista.png` | Lista de oportunidades com filtros |
| 06 | `06-kanban-fornecedor.png` | Kanban (Pendentes → Recusadas) |
| 07 | `07-declinar-oportunidade.png` | Ação Declinar + confirmação/registro |
| 08 | `08-proposta-multiplas-condicoes.png` | Formulário com 2+ condições (valor, pagamento, anexo) |
| 09 | `09-proposta-enviada-kanban.png` | Card da proposta na coluna Enviadas |
| 10 | `10-dashboard-fornecedor-kpis.png` | Dashboard fornecedor com KPIs preenchidos |
| 11 | `11-trava-plano-free.png` | Mensagem de bloqueio ao estourar 1 cotação/mês (Free) |

## Critérios de aceite

1. Declinar oportunidade remove a cotação da fila de pendentes e registra a recusa. ✅
2. Proposta com múltiplas condições persiste anexos por condição. ✅
3. Fornecedor Free não ultrapassa 1 cotação/mês. ✅
4. Documento vencido muda para `em_atraso`. ✅
5. Solicitante (mesmo que ainda sem comparativo completo) já vê contagem de propostas recebidas. ✅

## Dependências / riscos

- Convites reais do motor de distribuição chegam no Dia 4; até lá, seed/manual de invites para testes.
- Aprovação de compliance pelo Master Admin pode ser API + UI enxuta e refinada depois.
- Documentos de compliance: upload via **Firebase Storage** (ou `/uploads` local sem Admin).
- Sem Cloud Functions (Spark): expiração via lazy load + `npm run jobs:compliance-expire`.
