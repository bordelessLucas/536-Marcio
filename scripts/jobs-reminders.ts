/**
 * Ciclo de lembretes — solicitante (5/10 dias) e fornecedor (convites pendentes).
 * Uso: npm run jobs:reminders
 */
import { runReminderJob } from "../src/features/notifications/reminders";

async function main() {
  const result = await runReminderJob();
  console.log(
    `Reminders OK — solicitante: ${result.solicitante}, fornecedor: ${result.fornecedor}, days=${JSON.stringify(result.reminderDays)}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
