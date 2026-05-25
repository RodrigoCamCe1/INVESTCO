"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarPlus, Plus, RefreshCw, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { propertiesApi, clientsApi, reservationsApi } from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";
import type { Reservation, ReservationStatus } from "@/lib/api/types";

const STATUSES: ReservationStatus[] = ["ACTIVA", "VENCIDA", "CONVERTIDA", "CANCELADA"];
const color: Record<ReservationStatus, string> = {
  ACTIVA: "bg-amber-100 text-amber-700",
  VENCIDA: "bg-red-100 text-red-700",
  CONVERTIDA: "bg-emerald-100 text-emerald-700",
  CANCELADA: "bg-slate-100 text-slate-600",
};

const fmtMoney = (n: number, c = "BOB") =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "2-digit" });

export default function ReservasPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = React.useState<ReservationStatus | "ALL">("ALL");

  const reservationsQ = useQuery({ queryKey: ["reservations"], queryFn: reservationsApi.list });
  const propsQ = useQuery({ queryKey: ["properties"], queryFn: propertiesApi.list });
  const clientsQ = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });

  const propMap = React.useMemo(() => Object.fromEntries((propsQ.data ?? []).map((p) => [p.id, p])), [propsQ.data]);
  const clientMap = React.useMemo(() => Object.fromEntries((clientsQ.data ?? []).map((c) => [c.id, c])), [clientsQ.data]);

  const cancelMut = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dash", "reservations"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Reserva cancelada");
    },
    onError: (e) => toast.error("No se pudo cancelar", { description: extractApiError(e) }),
  });

  const items: Reservation[] = reservationsQ.data ?? [];
  const filtered = filter === "ALL" ? items : items.filter((r) => r.status === filter);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-5 p-6 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              § Reservas · {items.length} totales
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
              <CalendarPlus className="h-7 w-7 text-amber-600" />
              Reservas
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Bloqueo de inmueble por depósito · vence en días definidos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => reservationsQ.refetch()} disabled={reservationsQ.isFetching}>
              <RefreshCw className={reservationsQ.isFetching ? "animate-spin" : ""} />
              Recargar
            </Button>
            <Button size="sm" asChild>
              <Link href="/reservas/nueva">
                <Plus />
                Nueva reserva
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-1.5">
          {(["ALL", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                filter === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {s === "ALL" ? `Todas · ${items.length}` : `${s} · ${items.filter((r) => r.status === s).length}`}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {reservationsQ.isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">Sin reservas.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inmueble</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Depósito</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const prop = propMap[r.propertyId];
                  const client = clientMap[r.clientId];
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="text-sm font-bold text-slate-900">{prop?.code ?? r.propertyId.slice(0, 8)}</div>
                        <div className="text-xs text-slate-500">{prop?.address ?? "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-900">{client ? `${client.firstName} ${client.lastName}` : r.clientId.slice(0, 8)}</div>
                        <div className="font-mono text-xs text-slate-500">CI {client?.ci ?? "—"}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {fmtMoney(Number(r.depositAmount), r.currency)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{fmtDate(r.reservationDate)}</TableCell>
                      <TableCell className="font-mono text-xs">{fmtDate(r.expiresAt)}</TableCell>
                      <TableCell>
                        <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${color[r.status]}`}>{r.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {r.status === "ACTIVA" && (
                          <Button variant="ghost" size="sm" disabled={cancelMut.isPending} onClick={() => {
                            if (confirm("¿Cancelar reserva?")) cancelMut.mutate(r.id);
                          }}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
