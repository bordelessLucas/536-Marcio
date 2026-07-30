/**
 * Espelha collections de domínio Prisma → Firestore quando Admin SDK estiver configurado.
 * Uso: npm run sync:firestore
 */
import { prisma } from "../src/lib/prisma";
import { getAdminFirestore, isFirebaseAdminConfigured } from "../src/lib/firebase/admin";

async function upsertCollection(
  name: string,
  docs: Array<{ id: string; data: Record<string, unknown> }>,
) {
  const db = getAdminFirestore();
  const batchSize = 400;
  for (let i = 0; i < docs.length; i += batchSize) {
    const chunk = docs.slice(i, i + batchSize);
    const batch = db.batch();
    for (const item of chunk) {
      batch.set(db.collection(name).doc(item.id), item.data, { merge: true });
    }
    await batch.commit();
  }
  console.log(`  ${name}: ${docs.length}`);
}

async function main() {
  if (!isFirebaseAdminConfigured()) {
    console.log("FIREBASE_SERVICE_ACCOUNT_JSON / ADC ausente — sync pulado (domínio permanece no Prisma).");
    process.exit(0);
  }

  console.log("Sync Prisma → Firestore…");

  const [orgs, users, categories, services, plans, settings, banners] = await Promise.all([
    prisma.organization.findMany(),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firebaseUid: true,
        referralCode: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    }),
    prisma.serviceCategory.findMany(),
    prisma.serviceItem.findMany(),
    prisma.plan.findMany(),
    prisma.platformSettings.findMany(),
    prisma.landingBanner.findMany(),
  ]);

  await upsertCollection(
    "organizations",
    orgs.map((item) => ({
      id: item.id,
      data: {
        name: item.name,
        document: item.document,
        type: item.type,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    })),
  );

  await upsertCollection(
    "users",
    users.map((item) => ({
      id: item.id,
      data: {
        email: item.email,
        name: item.name,
        firebaseUid: item.firebaseUid,
        referralCode: item.referralCode,
        emailVerifiedAt: item.emailVerifiedAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      },
    })),
  );

  await upsertCollection(
    "service_categories",
    categories.map((item) => ({
      id: item.id,
      data: {
        name: item.name,
        slug: item.slug,
        colorToken: item.colorToken,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        deletedAt: item.deletedAt?.toISOString() ?? null,
      },
    })),
  );

  await upsertCollection(
    "service_items",
    services.map((item) => ({
      id: item.id,
      data: {
        categoryId: item.categoryId,
        name: item.name,
        slug: item.slug,
        isMandatory: item.isMandatory,
        periodicityHint: item.periodicityHint,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        deletedAt: item.deletedAt?.toISOString() ?? null,
      },
    })),
  );

  await upsertCollection(
    "plans",
    plans.map((item) => ({
      id: item.id,
      data: {
        slug: item.slug,
        name: item.name,
        audience: item.audience,
        isFree: item.isFree,
        monthlyQuota: item.monthlyQuota,
        priceCents: item.priceCents,
        featuresJson: item.featuresJson,
        isActive: item.isActive,
      },
    })),
  );

  await upsertCollection(
    "platform_settings",
    settings.map((item) => ({
      id: item.id,
      data: { ...item, updatedAt: item.updatedAt.toISOString() },
    })),
  );

  await upsertCollection(
    "landing_banners",
    banners.map((item) => ({
      id: item.id,
      data: {
        title: item.title,
        imageUrl: item.imageUrl,
        linkUrl: item.linkUrl,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        showOnLanding: item.showOnLanding,
        showInApp: item.showInApp,
      },
    })),
  );

  console.log("Sync Firestore OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
