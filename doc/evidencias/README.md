# Evidências diárias — protocolo de prints

Cada dia do sprint **só é considerado entregue** se as telas novas tiverem prints anexados para o cliente perceber o avanço.

## Pasta

```
doc/evidencias/
  dia-01/
  dia-02/
  dia-03/
  dia-04/
  dia-05/
  dia-06/
  dia-07/
```

## Regras

1. Nomear arquivos: `01-login.png`, `02-menu-sindico.png`, etc. (ordem do checklist do dia).
2. Preferir desktop; se o item for mobile, sufixo `-mobile`.
3. Mostrar dados de demo legíveis (sem dados reais sensíveis de produção).
4. Onde a regra for “bloqueio”, o print deve mostrar a **mensagem/trava na UI** (não só console).
5. Ao final do dia, enviar a pasta do dia (ou um PDF/collage) ao cliente com 1 linha de legenda por print.
6. Itens só de backend (jobs, webhooks) precisam de **tela de status/admin ou e-mail** printável — nunca “só log no terminal” como única evidência.

Checklist detalhado de prints: ver seção **“Evidências / Prints para o cliente”** em cada `dia-0X.md`.
