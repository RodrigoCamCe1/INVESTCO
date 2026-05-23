"use client";

import * as React from "react";
import { Bell, CheckCheck, Zap, AlertTriangle, Package, FileText, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  readAt: Date | null;
  icon: "reserva" | "calidad" | "compra" | "contrato" | "sistema";
}

// Utility: human-readable relative time
function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "justo ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  return `hace ${diffDays}d`;
}

// Icon resolver
function NotifIcon({ type }: { type: AppNotification["icon"] }) {
  const base = "h-4 w-4 shrink-0";
  if (type === "reserva") return <Star className={cn(base, "text-indigo-500")} />;
  if (type === "calidad") return <AlertTriangle className={cn(base, "text-amber-500")} />;
  if (type === "compra") return <Package className={cn(base, "text-emerald-500")} />;
  if (type === "contrato") return <FileText className={cn(base, "text-blue-500")} />;
  return <Zap className={cn(base, "text-slate-400")} />;
}

// Random notification generator for simulated WebSocket push
const RANDOM_NOTIF_POOL: Omit<AppNotification, "id" | "createdAt" | "readAt">[] = [
  {
    title: "Nueva visita programada",
    body: "Cliente Pérez agendó visita a Lote Premium Urubó para mañana 10:00.",
    icon: "reserva",
  },
  {
    title: "Informe de obra actualizado",
    body: "Encargado Méndez registró avance del 78% en Torre Piraí.",
    icon: "calidad",
  },
  {
    title: "OC aprobada por Gerencia",
    body: "Orden de compra #OC-4482 (Cemento 500 sacos) autorizada.",
    icon: "compra",
  },
  {
    title: "Contrato generado",
    body: "Contrato CON-7730-2026 listo para firma digital del cliente Torrico.",
    icon: "contrato",
  },
  {
    title: "Alerta del sistema",
    body: "Sesión simulada activa en MODO DEMO. Datos ficticios.",
    icon: "sistema",
  },
];

// Initial mock notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-001",
    title: "Nueva reserva en Urubó",
    body: "Cliente Alejandro Siles registró depósito de reserva por USD 14,500 para Lote Premium Urubó.",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    readAt: null,
    icon: "reserva",
  },
  {
    id: "n-002",
    title: "Hallazgo de calidad crítico — Torre Piraí",
    body: "Ing. Méndez reportó no conformidad en sector B: fisuras en muro portante. Requiere acción inmediata.",
    createdAt: new Date(Date.now() - 28 * 60 * 1000),
    readAt: null,
    icon: "calidad",
  },
  {
    id: "n-003",
    title: "OC pendiente de aprobación",
    body: "Orden de compra #OC-4481 por Bs. 45,200 (Fierro corrugado) requiere aprobación de Gerencia.",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    readAt: null,
    icon: "compra",
  },
  {
    id: "n-004",
    title: "Contrato firmado digitalmente",
    body: "Gabriela Prado completó firma del contrato CON-7728-2026. Listo para protocolización.",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000),
    readAt: new Date(Date.now() - 4 * 3600 * 1000),
    icon: "contrato",
  },
  {
    id: "n-005",
    title: "Reporte mensual generado",
    body: "El reporte ejecutivo de Mayo 2026 fue generado y está disponible para descarga en PDF.",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
    readAt: new Date(Date.now() - 20 * 3600 * 1000),
    icon: "sistema",
  },
];

export function NotificationBell() {
  const [notifications, setNotifications] =
    React.useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [open, setOpen] = React.useState(false);

  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && n.readAt === null ? { ...n, readAt: new Date() } : n))
    );
  };

  // Mark all as read
  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.readAt === null ? { ...n, readAt: new Date() } : n))
    );
  };

  // Simulated real-time WebSocket via setInterval (30s cadence)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const pool = RANDOM_NOTIF_POOL;
      const template = pool[Math.floor(Math.random() * pool.length)];
      const newNotif: AppNotification = {
        ...template,
        id: `n-rt-${Date.now()}`,
        createdAt: new Date(),
        readAt: null,
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 20)); // cap at 20
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {/* Badge de conteo */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-4 px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full leading-none shadow-sm animate-in fade-in zoom-in duration-150">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 shadow-xl border border-slate-200/80 rounded-xl overflow-hidden bg-white"
      >
        {/* Header del Dropdown */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <DropdownMenuLabel className="text-sm font-bold text-slate-800 p-0 flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-indigo-500" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-4 text-[9px] px-1.5 font-black ml-1">
                {unreadCount} sin leer
              </Badge>
            )}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Marcar todas
            </button>
          )}
        </div>

        {/* Lista de Notificaciones */}
        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Sin notificaciones
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.slice(0, 10).map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-indigo-50/50 rounded-none",
                    notif.readAt === null
                      ? "bg-indigo-50/30 hover:bg-indigo-50/60"
                      : "hover:bg-slate-50"
                  )}
                >
                  {/* Dot de no leído */}
                  <div className="relative mt-0.5 shrink-0">
                    <NotifIcon type={notif.icon} />
                    {notif.readAt === null && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={cn("text-xs font-bold leading-tight truncate text-slate-800",
                      notif.readAt === null ? "" : "font-semibold text-slate-600"
                    )}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {relativeTime(notif.createdAt)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/60 text-center">
          <span className="text-[10px] text-slate-400 font-medium">
            Simulando WebSocket — actualización cada 30s
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
