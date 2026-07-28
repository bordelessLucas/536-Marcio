import { PrismaClient } from "@prisma/client";
import { markOverdueCompliance } from "../src/features/compliance/expire";

const prisma = new PrismaClient();

async function main() {
  const count = await markOverdueCompliance();
  console.log(`Compliance expire: ${count} documento(s) → em_atraso`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
