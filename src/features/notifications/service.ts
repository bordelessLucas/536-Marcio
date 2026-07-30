import { MemberRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateNotificationInput = {
  userId: string;
  organizationId?: string | null;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      organizationId: input.organizationId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

export async function notifyOrgMembers(
  organizationId: string,
  input: {
    type: string;
    title: string;
    body: string;
    href?: string | null;
    metadata?: Record<string, unknown>;
    roles?: MemberRole[];
    /** Se true, omite operacionais (ex.: comissões). */
    mastersOnly?: boolean;
  },
) {
  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId,
      ...(input.mastersOnly
        ? { role: MemberRole.master }
        : input.roles
          ? { role: { in: input.roles } }
          : {}),
    },
    select: { userId: true },
  });

  if (members.length === 0) return [];

  return prisma.$transaction(
    members.map((member) =>
      prisma.notification.create({
        data: {
          userId: member.userId,
          organizationId,
          type: input.type,
          title: input.title,
          body: input.body,
          href: input.href ?? null,
          metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      }),
    ),
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function listNotifications(userId: string, take = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
