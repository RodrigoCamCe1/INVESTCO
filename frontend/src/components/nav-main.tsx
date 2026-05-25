"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  CalendarPlus,
  FileSignature,
  FolderKanban,
  ShoppingCart,
  ShieldCheck,
  BarChart3,
  LayoutDashboard,
  FileArchive,
  Truck,
  BriefcaseBusiness,
  UserCog,
  ClipboardList,
  Smartphone,
  Layers3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/constants/permissions";
import type { PermissionCode } from "@/constants/permissions";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: PermissionCode | null; // null = visible para todos los autenticados
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    label: "Desarrollos",
    href: "/desarrollos",
    icon: Layers3,
    permission: PERMISSIONS.PROJECTS_READ,
  },
  {
    label: "Inmuebles",
    href: "/inmuebles",
    icon: Building2,
    permission: PERMISSIONS.PROPERTIES_READ,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    permission: PERMISSIONS.CLIENTS_READ,
  },
  {
    label: "Reservas",
    href: "/reservas",
    icon: CalendarPlus,
    permission: PERMISSIONS.RESERVATIONS_READ,
  },
  {
    label: "Contratos",
    href: "/contratos",
    icon: FileSignature,
    permission: PERMISSIONS.CONTRACTS_READ,
  },
  {
    label: "Planos / Diseño",
    href: "/planos",
    icon: FileArchive,
    permission: PERMISSIONS.PROPERTIES_READ,
  },
  {
    label: "Proyectos / Obra",
    href: "/proyectos",
    icon: FolderKanban,
    permission: PERMISSIONS.PROJECTS_READ,
  },
  {
    label: "Compras (OC)",
    href: "/compras",
    icon: ShoppingCart,
    permission: PERMISSIONS.PURCHASE_ORDERS_READ,
  },
  {
    label: "Catálogo Proveedores",
    href: "/compras/proveedores",
    icon: Truck,
    permission: PERMISSIONS.PURCHASE_ORDERS_READ,
  },
  {
    label: "Tesorería / Pagos",
    href: "/pagos",
    icon: BriefcaseBusiness,
    permission: null, // Asumimos visible para roles administrativos
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS_READ,
  },
  {
    label: "Usuarios",
    href: "/admin/usuarios",
    icon: UserCog,
    permission: PERMISSIONS.USERS_MANAGE,
  },
  {
    label: "Auditoría",
    href: "/admin/auditoria",
    icon: ClipboardList,
    permission: PERMISSIONS.USERS_MANAGE,
  },
  {
    label: "📱 PWA Campo",
    href: "/obra-mobile",
    icon: Smartphone,
    permission: PERMISSIONS.PROJECTS_READ,
  },
];

interface NavMainProps {
  /** Flat list of permission codes from the current session */
  userPermissions: PermissionCode[];
}

export function NavMain({ userPermissions }: NavMainProps) {
  const pathname = usePathname();

  // Filter: only show items whose required permission is present (or null = public)
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.permission === null || userPermissions.includes(item.permission)
  );

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
      {visibleItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group",
              isActive
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/30"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isActive
                  ? "text-white"
                  : "text-slate-500 group-hover:text-slate-300"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
