# Dia 4 — Motor de Distribuição, Comparativo, Negociação e Aprovação

**Objetivo do dia:** fechar o ciclo principal da plataforma — distribuir cotações, comparar propostas e finalizar (negociar / aprovar / outros).

**Módulos cobertos:** 6.1 (parcial), 6.2, 7.

**Status:** implementação funcional **100% OK** (DistributionEngine com refill pós-declínio, comparativo, negociar/aprovar/outros, favoritos Premium por categoria; `smoke:dia-04`). Faltam os **11 prints** em `doc/evidencias/dia-04/`.

---

## 1. Motor de distribuição inteligente (Módulo 7)

- [x] Serviço `DistributionEngine` acionado em `quotation.created` e quando houver espaço até a meta máxima
- [x] Implementar prioridades:
  1. Favoritos da Administradora (categoria + plano pago + saldo)
  2. Pagantes + Compliant (docs aprovados, seleção aleatória)
  3. Pagantes com pendência documental
  4. Plano Free (categoria CNPJ + trava 1/mês) como fallback
- [x] Criar `quotation_invites` para cada fornecedor elegível
- [x] Parar distribuição ao atingir **propostas máximas** (e/ou convites suficientes conforme regra definida)
- [x] Logs de auditoria: por que cada fornecedor foi/não foi selecionado
- [x] Feature flag / testes unitários das regras de prioridade (`DISTRIBUTION_ENGINE_ENABLED`, `smoke:dia-04`)

## 2. Metas mínima e máxima

- [x] Ao atingir propostas mínimas → emitir evento `quotation.min_proposals_reached`
- [x] Ao atingir propostas máximas → pausar novos recebimentos/convites
- [x] Contadores atômicos na cotação (`proposalsCount`)
- [x] UI do solicitante mostra progresso min/max

## 3. Tela de consulta e comparativo (Módulo 6.1 — base)

- [x] Tabela comparativa agrupando propostas e condições
- [x] Exibir valor, condição de pagamento, anexos, fornecedor, status
- [x] Ordenação por valor / data
- [x] Seleção de uma condição específica para ação
- [x] Preparar dados para exportação PDF (implementação Whitelabel no Dia 7)

## 4. Fluxo Negociar (Módulo 6.2 — caminho 1)

- [x] Ação "Negociar" para fornecedor específico ou todos selecionados
- [x] Status cotação/proposta → `em_negociacao`
- [x] Canal de mensagens/contrapropostas na plataforma
- [x] Fornecedor pode atualizar condições em resposta
- [x] Eventos `negotiation.started` / `negotiation.message`

## 5. Fluxo Aprovar plataforma (Módulo 6.2 — caminho 2)

- [x] Aceite final de uma condição/proposta
- [x] Proposta escolhida → `aprovada`
- [x] Demais propostas da cotação → `recusadas`
- [x] Cotação → `aprovada`
- [x] Alimentar hook de comissionamento (consumido no Dia 5)
- [x] Registrar auditoria completa
- [x] Encerrar lembretes do solicitante (hook Dia 6)

## 6. Fluxo Aprovação Outros (Módulo 6.2 — caminho 3)

- [x] Modal/formulário obrigatório: Nome da empresa + Valor final ($)
- [x] Status → `finalizada_outros`
- [x] Notificar fornecedores participantes (evento)
- [x] Encerrar ciclo de lembretes do solicitante
- [x] Persistir dados sob rótulo "Outros" para auditoria/relatórios

## 7. Favoritos da Administradora (base Premium)

- [x] Modelagem `favorite_suppliers`
- [x] UI de favoritar (visível só Adm Premium; Free bloqueado)
- [x] Integração com prioridade 1 do motor

## 8. Entregáveis do dia

- [x] Cotação aberta dispara convites na ordem correta de prioridade
- [x] Solicitante compara propostas e consegue Negociar / Aprovar / Outros
- [x] Aprovar rejeita automaticamente as demais
- [x] Outros exige campos e finaliza o ciclo
- [ ] **Pasta `doc/evidencias/dia-04/` preenchida** com os prints abaixo

### Smoke

```bash
npm run db:setup
npm run smoke:dia-04
```

## Evidências / Prints para o cliente

> Obrigatório. Sem esses prints o dia não fecha. Salvar em `doc/evidencias/dia-04/`.

| # | Arquivo sugerido | O que mostrar na tela |
|---|------------------|------------------------|
| 01 | `01-convites-distribuidos.png` | Cotação com fornecedores convidados (lista/prioridade visível) |
| 02 | `02-progresso-metas.png` | UI com progresso propostas mínimas/máximas |
| 03 | `03-comparativo-propostas.png` | Tabela comparativa com valores/condições/anexos |
| 04 | `04-negociar-chat.png` | Fluxo Negociar + canal de mensagens na plataforma |
| 05 | `05-status-em-negociacao.png` | Status “Em Negociação” na cotação/proposta |
| 06 | `06-aprovar-plataforma.png` | Confirmação de aprovação de uma condição |
| 07 | `07-demais-recusadas.png` | Demais propostas automaticamente recusadas |
| 08 | `08-aprovacao-outros.png` | Modal Outros com Nome da empresa + Valor |
| 09 | `09-finalizada-outros.png` | Cotação com status Finalizada - Outros |
| 10 | `10-favoritos-adm.png` | Tela de favoritar fornecedor (Adm Premium) |
| 11 | `11-meta-maxima-pausada.png` | Indicador de recebimento pausado ao atingir máxima |

## Critérios de aceite

1. Distribuição respeita a ordem Favoritos → Compliant → Pendentes → Free. ✅
2. Free do fornecedor só entra como fallback e respeita 1/mês. ✅
3. Atingir máxima impede novas propostas. ✅
4. Aprovar uma condição rejeita as outras na mesma cotação. ✅
5. "Outros" sem nome ou valor é bloqueado na validação. ✅
6. Histórico de negociação fica registrado na plataforma. ✅

## Dependências / riscos

- Favoritos Premium: seed Adm usa `adm-premium` + `favorites: true`.
- Notificações reais ficam no Dia 6; hoje emitir eventos/domain events é suficiente.
- Flag: `DISTRIBUTION_ENGINE_ENABLED=false` desliga o motor (default ligado).
