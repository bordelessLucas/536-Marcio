import { MemberRole, OrganizationType } from "@prisma/client";
import {
  Bell,
  Building2,
  ClipboardList,
  FileCheck2,
  Handshake,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: MemberRole[];
  types?: OrganizationType[];
  financialOnly?: boolean;
};

const ALL_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    label: "Condomínios",
    href: "/app/condominios",
    icon: Building2,
    types: [OrganizationType.sindico, OrganizationType.administradora],
  },
  {
    label: "Cotações",
    href: "/app/cotacoes",
    icon: ClipboardList,
    types: [OrganizationType.sindico, OrganizationType.administradora],
  },
  {
    label: "Oportunidades",
    href: "/app/oportunidades",
    icon: ClipboardList,
    types: [OrganizationType.fornecedor],
  },
  {
    label: "Compliance",
    href: "/app/compliance",
    icon: FileCheck2,
    types: [OrganizationType.fornecedor],
  },
  {
    label: "Meu Plano",
    href: "/app/meu-plano",
    icon: Wallet,
    types: [OrganizationType.fornecedor],
  },
  {
    label: "Parcerias",
    href: "/app/parcerias",
    icon: Handshake,
    types: [OrganizationType.administradora],
    roles: [MemberRole.master],
  },
  {
    label: "Favoritos",
    href: "/app/favoritos",
    icon: Handshake,
    types: [OrganizationType.administradora],
    roles: [MemberRole.master],
  },
  {
    label: "Financeiro",
    href: "/app/financeiro",
    icon: Wallet,
    types: [OrganizationType.administradora],
    roles: [MemberRole.master],
    financialOnly: true,
  },
  {
    label: "Equipe",
    href: "/app/equipe",
    icon: Users,
    types: [OrganizationType.administradora],
  },
  {
    label: "Notificações",
    href: "/app/notificacoes",
    icon: Bell,
  },
  {
    label: "Plataforma",
    href: "/app/plataforma",
    icon: Shield,
    types: [OrganizationType.master_admin],
  },
  {
    label: "Catálogo",
    href: "/app/plataforma/catalogo",
    icon: ClipboardList,
    types: [OrganizationType.master_admin],
  },
  {
    label: "Compliance",
    href: "/app/plataforma/compliance",
    icon: FileCheck2,
    types: [OrganizationType.master_admin],
  },
  {
    label: "Configurações",
    href: "/app/configuracoes",
    icon: Settings,
  },
];

export function canAccessNavItem(
  item: NavItem,
  input: {
    organizationType: OrganizationType;
    role: MemberRole;
  },
): boolean {
  if (item.types && !item.types.includes(input.organizationType)) {
    return false;
  }
  if (item.roles && !item.roles.includes(input.role)) {
    return false;
  }
  if (item.financialOnly && input.role !== MemberRole.master) {
    return false;
  }
  return true;
}

export function canAccessHref(
  href: string,
  input: {
    organizationType: OrganizationType;
    role: MemberRole;
  },
): boolean {
  const item = ALL_ITEMS.find((navItem) => navItem.href === href);
  if (!item) return true;
  return canAccessNavItem(item, input);
}

export function getNavItemsForSession(input: {
  organizationType: OrganizationType;
  role: MemberRole;
}): NavItem[] {
  return ALL_ITEMS.filter((item) => canAccessNavItem(item, input));
}

export function profileLabel(type: OrganizationType, role: MemberRole): string {
  if (type === OrganizationType.master_admin) return "Master Admin";
  if (type === OrganizationType.fornecedor) return "Fornecedor";
  if (type === OrganizationType.sindico) return "Síndico";
  if (type === OrganizationType.administradora) {
    return role === MemberRole.master ? "Administradora · Master" : "Administradora · Operacional";
  }
  return "Usuário";
}
