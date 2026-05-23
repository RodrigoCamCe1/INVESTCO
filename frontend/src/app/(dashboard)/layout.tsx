"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Smartphone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { useAuthSession } from "@/providers/auth-session-provider";
import { NavMain } from "@/components/nav-main";
import { NotificationBell } from "@/components/notification-bell";
import { BannerDemo } from "@/components/banner-demo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Returns initials from a full name, e.g. "Ana López" → "AL" */
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isAuthenticated, logout } = useAuthSession();

  // Redirect unauthenticated users → login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Suppress render until hydrated
  if (!session) return null;

  const { user, permissions } = session;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ================================================================
          SIDEBAR
      ================================================================ */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-slate-950 border-r border-slate-800/80">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800/80">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">INVESTCO</span>
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              ERP Constructora
            </span>
          </div>
        </div>

        {/* RBAC-filtered navigation — powered by permissions[] */}
        <NavMain userPermissions={permissions} />

        {/* Campo / Obra special link */}
        <div className="px-3 pb-2">
          <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-600">
            Campo & Obra
          </p>
          <Link
            href="/obra-mobile"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all group",
              pathname === "/obra-mobile"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
            )}
          >
            <Smartphone
              className={cn(
                "h-4 w-4 shrink-0",
                pathname === "/obra-mobile"
                  ? "text-white"
                  : "text-slate-500 group-hover:text-slate-300"
              )}
            />
            Móvil de Campo (PWA)
          </Link>
        </div>

        {/* Session footer */}
        <div className="border-t border-slate-800/80 p-3 space-y-1 mt-auto">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar className="h-7 w-7 shrink-0 bg-indigo-700 text-white">
              <AvatarFallback className="bg-indigo-700 text-white text-[10px]">
                {initials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-300 truncate">
                {user.fullName}
              </span>
              <span className="block text-[10px] text-slate-500 truncate">
                {user.roles.join(", ")}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-xs font-semibold text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors cursor-pointer group"
          >
            <LogOut className="h-4 w-4 shrink-0 group-hover:text-red-400" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ================================================================
          MAIN AREA
      ================================================================ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* BannerDemo — absolute top, conditional on NEXT_PUBLIC_USE_MOCKS */}
        <BannerDemo />

        {/* Top Navbar */}
        <header className="shrink-0 h-13 bg-white border-b border-slate-200/80 px-5 flex items-center justify-between shadow-xs">
          {/* Left: mobile brand / breadcrumb placeholder */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-7 w-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">INVESTCO</span>
          </div>

          {/* Right: Avatar + Bell */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Chip */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <Avatar className="h-7 w-7 bg-indigo-600 text-white">
                <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                  {initials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right leading-tight">
                <span className="block text-xs font-semibold text-slate-800">
                  {user.fullName}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {user.roles.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
