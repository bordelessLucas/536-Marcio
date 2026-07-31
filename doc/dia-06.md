# Dia 6 — Notificações, Indicação e Painel Master Admin

**Objetivo do dia:** fechar o Growth Loop operacional — alertas automáticos, programa de indicação e o painel do dono da plataforma (incluindo CMS de banners/WhatsApp/catálogo).

**Módulos cobertos:** 1.3, 8.1, 8.2, 9 (+ CMS marketing).

**Status:** implementação funcional **OK** (sino, outbox de e-mail, lembretes 5/10, indicações com status Free/Pago, Master Admin params/relatórios/banners; `smoke:dia-06`). Faltam os **11 prints** em `doc/evidencias/dia-06/`.

---

## 1. Central de notificações em tempo real (Sino)

- [x] Modelo `notifications` + listeners Firestore / Cloud Functions (tempo real)
- [x] Ícone de sino com badge de não lidas
- [x] Marcar como lida / marcar todas
- [x] Gatilhos (consumir domain events dos dias anteriores):
  - Nova proposta recebida
  - Início / aceite de negociação
  - Alteração de status da cotação
  - Aprovação / recusa
  - Atualização de compliance
  - Nova comissão (visível só ao Master da Adm)
- [x] Deep-link da notificação para a tela correta

> Nota: tempo real MVP via revalidate/SSR no layout (badge a cada request). Polling/Firestore listeners ficam como evolução.

## 2. Notificações por e-mail

- [x] Provider de e-mail abstrato (SendGrid/Resend/etc. via interface)
- [x] Template: meta mínima de propostas atingida (solicitante)
- [x] Templates: convite de cotação, lembretes, aprovação, Outros, compliance
- [x] Preferências básicas (se houver tempo) ou defaults sensatos

## 3. Ciclo automático de lembretes (Módulo 1.3)

- [x] Job/cron parametrizável (padrão **5 e 10 dias** para solicitante)
- [x] Solicitante: alerta se cotação aberta ou sem escolha final
- [x] Mensagem orientativa pedindo finalizar (aprovar ou "Outros")
- [x] Fornecedor: lembretes contínuos após convite até:
  - Enviar proposta **ou**
  - Declinar oportunidade
- [x] Parar lembretes imediatamente em: aprovação, Outros, declínio, envio de proposta
- [x] `platform_settings.reminder_days` editável pelo Master Admin

## 4. Programa de indicação (Módulo 8)

- [x] Link unificado de indicação por usuário/organização
- [x] Rastreamento de cadastros originados pelo link (cookie/token)
- [x] Status do indicado: `cadastrado_free` | `ativo_pago`
- [x] Painel consolidado para todos os perfis:
  - Lista de indicados (nome/razão social)
  - Status
  - Total acumulado de cashback/comissão
  - Histórico de pagamentos e resgates
- [x] Regras de crédito quando indicado vira plano pago (evento de upgrade)

## 5. Painel Master Admin — parametrização (Módulo 9)

- [x] Franquia Free global (default 15) + override por cliente
- [x] Limites XX (Pro) e YY (Premium) de cotações do fornecedor + override
- [x] Configuração de mensalidades e preço de categorias adicionais
- [x] Prazos de lembretes (5/10 editáveis)
- [x] Toggle da trava de parceria (Growth Loop)
- [x] Liberação especial de features (ex.: Whitelabel Free em negociação)
- [x] Polimento do CRUD de categorias/serviços (se faltou no Dia 2)
- [x] Gestão de **banners da landing** (até 10: upload, ordem, link externo, ativo/inativo)
- [x] Configurar URL do WhatsApp "Falar com um especialista"
- [x] Configurar URL do Blog externo
- [x] Campos para scripts de pixel / hosts da LP Fornecedores

## 6. Painel Master Admin — operação

- [x] Fila de migrações de perfil (aprovar/rejeitar)
- [x] Liberação de upgrades/recursos especiais
- [x] Histórico de trocas de plano e pró-rata
- [x] Auditoria de compliance documental (aprovar/rejeitar)
- [x] Relatórios globais (versão 1):
  - Conversão de planos
  - Indicações ativas
  - Volume transacionado
  - Métricas de cotações "Outros"
  - Origem de leads (UTM da LP Fornecedores, se disponível)

## 7. Entregáveis do dia

- [x] Sino e e-mails disparando nos eventos principais
- [x] Lembretes 5/10 e ciclo do fornecedor funcionando com pausa correta
- [x] Link de indicação rastreando cadastro
- [x] Master Admin parametriza franquias, banners, WhatsApp e vê relatórios básicos
- [ ] **Pasta `doc/evidencias/dia-06/` preenchida** com os prints abaixo

### Smoke

```bash
npm run db:setup
npm run smoke:dia-06
```

## Evidências / Prints para o cliente

> Obrigatório. Sem esses prints o dia não fecha. Salvar em `doc/evidencias/dia-06/`.

| # | Arquivo sugerido | O que mostrar na tela |
|---|------------------|------------------------|
| 01 | `01-sino-badge.png` | Ícone de sino com badge de não lidas |
| 02 | `02-painel-notificacoes.png` | Lista de notificações (proposta/negociação/status) |
| 03 | `03-email-meta-minima.png` | Print do e-mail de meta mínima atingida (inbox ou preview) |
| 04 | `04-lembrete-solicitante.png` | Notificação/e-mail de lembrete 5 ou 10 dias |
| 05 | `05-indicacao-link.png` | Tela com link unificado de indicação |
| 06 | `06-painel-indicados.png` | Lista de indicados com status Free / Ativo Pago |
| 07 | `07-master-franquia.png` | Parametrização de franquia global + override por cliente |
| 08 | `08-master-banners.png` | Gestão de banners (lista ≤10 com ordem/link/ativo) |
| 09 | `09-master-whatsapp-blog.png` | Campos WhatsApp + URL do Blog |
| 10 | `10-relatorios-globais.png` | Relatórios (conversão, indicações, Outros, volume) |
| 11 | `11-comissao-sino-so-master.png` | Sino do Master com comissão vs Operacional sem esse item |

## Critérios de aceite

1. Meta mínima gera e-mail + sino no momento exato. ✅
2. Após "Outros" ou aprovação, solicitante para de receber lembretes. ✅
3. Após Declinar ou Enviar Proposta, fornecedor para de receber lembretes daquela cotação. ✅
4. Indicação Free→Pago atualiza status e métricas financeiras. ✅
5. Override individual de franquia prevalece sobre o global. ✅
6. Comissões no sino só aparecem para Master da Adm. ✅
7. Master Admin consegue publicar até 10 banners com links externos. ✅
8. WhatsApp do CTA é editável sem deploy de código. ✅

## Dependências / riscos

- Jobs precisam rodar em staging com clock confiável (timezone America/Sao_Paulo).
- Volume de e-mail: rate limit e fila para não bloquear request HTTP.
- Conteúdo final dos banners/copy da LP pode chegar atrasado — usar placeholders editáveis.
