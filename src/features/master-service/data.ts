import type { ServicePipelineStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SERVICE_PIPELINE_ORDER } from "./pipeline";

export async function listServiceClients(managedByOrgId: string) {
  return prisma.serviceClient.findMany({
    where: { managedByOrgId },
    include: {
      clientOrg: true,
      managers: { orderBy: { createdAt: "asc" } },
      _count: { select: { quotations: true } },
    },
    orderBy: { displayName: "asc" },
  });
}

export async function getServiceClient(id: string, managedByOrgId: string) {
  return prisma.serviceClient.findFirst({
    where: { id, managedByOrgId },
    include: {
      clientOrg: true,
      managers: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getServicePipelineCounts(managedByOrgId: string) {
  const groups = await prisma.quotation.groupBy({
    by: ["servicePipelineStatus"],
    where: {
      serviceManagedByOrgId: managedByOrgId,
      servicePipelineStatus: { not: null },
    },
    _count: { _all: true },
  });

  const counts = Object.fromEntries(
    SERVICE_PIPELINE_ORDER.map((status) => [status, 0]),
  ) as Record<ServicePipelineStatus, number>;

  for (const row of groups) {
    if (row.servicePipelineStatus) {
      counts[row.servicePipelineStatus] = row._count._all;
    }
  }

  return counts;
}

export async function listServiceQuotations(input: {
  managedByOrgId: string;
  status?: ServicePipelineStatus;
  serviceClientId?: string;
  take?: number;
}) {
  return prisma.quotation.findMany({
    where: {
      serviceManagedByOrgId: input.managedByOrgId,
      ...(input.status ? { servicePipelineStatus: input.status } : {}),
      ...(input.serviceClientId ? { serviceClientId: input.serviceClientId } : {}),
    },
    include: {
      condominium: true,
      category: true,
      serviceItem: true,
      organization: true,
      serviceClient: true,
      proposals: {
        include: {
          organization: true,
          conditions: { orderBy: { sortOrder: "asc" } },
          messages: { orderBy: { createdAt: "asc" }, take: 20 },
        },
      },
      rifAnalyses: { orderBy: { createdAt: "desc" }, take: 3 },
      attachments: true,
    },
    orderBy: { updatedAt: "desc" },
    take: input.take ?? 100,
  });
}

export async function getServiceQuotation(id: string, managedByOrgId: string) {
  return prisma.quotation.findFirst({
    where: { id, serviceManagedByOrgId: managedByOrgId },
    include: {
      condominium: true,
      category: true,
      serviceItem: true,
      organization: true,
      serviceClient: true,
      proposals: {
        include: {
          organization: true,
          conditions: {
            orderBy: { sortOrder: "asc" },
            include: { attachments: true },
          },
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
      invites: { include: { supplier: true } },
      rifAnalyses: { orderBy: { createdAt: "desc" } },
      attachments: true,
    },
  });
}

export async function getServiceReports(managedByOrgId: string) {
  const clients = await prisma.serviceClient.findMany({
    where: { managedByOrgId },
    select: { id: true, displayName: true, clientOrgId: true },
  });

  const clientOrgIds = clients.map((c) => c.clientOrgId);

  const [byStatus, byCategory, topOrgs, volumeBySupplier] = await Promise.all([
    prisma.quotation.groupBy({
      by: ["servicePipelineStatus"],
      where: { serviceManagedByOrgId: managedByOrgId },
      _count: { _all: true },
    }),
    prisma.quotation.groupBy({
      by: ["categoryId"],
      where: { serviceManagedByOrgId: managedByOrgId },
      _count: { _all: true },
      orderBy: { _count: { categoryId: "desc" } },
      take: 10,
    }),
    prisma.quotation.groupBy({
      by: ["organizationId"],
      where: {
        serviceManagedByOrgId: managedByOrgId,
        organizationId: { in: clientOrgIds.length ? clientOrgIds : ["__none__"] },
      },
      _count: { _all: true },
      orderBy: { _count: { organizationId: "desc" } },
      take: 10,
    }),
    prisma.proposal.findMany({
      where: {
        status: "aprovada",
        quotation: { serviceManagedByOrgId: managedByOrgId },
      },
      include: {
        organization: true,
        conditions: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      take: 50,
    }),
  ]);

  const categories = await prisma.serviceCategory.findMany({
    where: { id: { in: byCategory.map((r) => r.categoryId) } },
  });
  const orgs = await prisma.organization.findMany({
    where: { id: { in: topOrgs.map((r) => r.organizationId) } },
  });

  const supplierVolume = new Map<string, { name: string; cents: number; count: number }>();
  for (const proposal of volumeBySupplier) {
    const amount = proposal.conditions[0]?.amountCents ?? 0;
    const current = supplierVolume.get(proposal.organizationId) ?? {
      name: proposal.organization.name,
      cents: 0,
      count: 0,
    };
    current.cents += amount;
    current.count += 1;
    supplierVolume.set(proposal.organizationId, current);
  }

  return {
    clientsCount: clients.length,
    byStatus,
    byCategory: byCategory.map((row) => ({
      categoryId: row.categoryId,
      name: categories.find((c) => c.id === row.categoryId)?.name ?? "Categoria",
      count: row._count._all,
    })),
    topClients: topOrgs.map((row) => ({
      organizationId: row.organizationId,
      name: orgs.find((o) => o.id === row.organizationId)?.name ?? "Cliente",
      count: row._count._all,
    })),
    supplierVolume: [...supplierVolume.values()].sort((a, b) => b.cents - a.cents),
  };
}

export async function getMarketIntelligence() {
  const [byRegionHint, byCategory, topRequesters, avgByCategory] = await Promise.all([
    prisma.condominium.groupBy({
      by: ["address"],
      _count: { _all: true },
      orderBy: { _count: { address: "desc" } },
      take: 15,
    }),
    prisma.quotation.groupBy({
      by: ["categoryId"],
      _count: { _all: true },
      orderBy: { _count: { categoryId: "desc" } },
      take: 10,
    }),
    prisma.quotation.groupBy({
      by: ["organizationId"],
      _count: { _all: true },
      orderBy: { _count: { organizationId: "desc" } },
      take: 10,
    }),
    prisma.proposalCondition.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        proposal: {
          include: {
            quotation: { select: { categoryId: true } },
          },
        },
      },
    }),
  ]);

  const categories = await prisma.serviceCategory.findMany({
    where: { id: { in: byCategory.map((r) => r.categoryId) } },
  });
  const orgs = await prisma.organization.findMany({
    where: { id: { in: topRequesters.map((r) => r.organizationId) } },
  });

  const avgMap = new Map<string, { sum: number; n: number }>();
  for (const condition of avgByCategory) {
    const categoryId = condition.proposal.quotation.categoryId;
    const current = avgMap.get(categoryId) ?? { sum: 0, n: 0 };
    current.sum += condition.amountCents;
    current.n += 1;
    avgMap.set(categoryId, current);
  }

  return {
    regions: byRegionHint.map((row) => ({
      label: row.address.split("—").pop()?.trim() || row.address.slice(0, 40),
      count: row._count._all,
    })),
    categories: byCategory.map((row) => ({
      name: categories.find((c) => c.id === row.categoryId)?.name ?? "Categoria",
      count: row._count._all,
      avgCents:
        avgMap.get(row.categoryId) && avgMap.get(row.categoryId)!.n > 0
          ? Math.round(avgMap.get(row.categoryId)!.sum / avgMap.get(row.categoryId)!.n)
          : null,
    })),
    topRequesters: topRequesters.map((row) => ({
      name: orgs.find((o) => o.id === row.organizationId)?.name ?? "Empresa",
      count: row._count._all,
    })),
  };
}
