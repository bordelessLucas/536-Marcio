/**
 * Disparo automático de solicitações conforme antecedência do calendário.
 * Uso: npm run jobs:appointments
 */
import { runAppointmentDispatchJob } from "../src/features/appointments/dispatch-job";

async function main() {
  const result = await runAppointmentDispatchJob();
  console.log(
    `Appointments OK — dispatched: ${result.dispatched}, checked: ${result.checked}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
