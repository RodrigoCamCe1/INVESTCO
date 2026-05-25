"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FileSignature, Plus, RefreshCw, Loader2,
  Send, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { contractsApi, reservationsApi, propertiesApi, clientsApi } from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";
import type { Contract, ContractStatus } from "@/lib/api/types";

const STATUSES: ContractStatus[] = ["BORRADOR", "REVISION", "FIRMADO", "MODIFICADO", "RESCINDIDO"];
const color: Record<ContractStatus, string> = {
  BORRADOR: "bg-slate-100 text-slate-700",
  REVISION: "bg-indigo-100 text-indigo-700",
  FIRMADO: "bg-emerald-100 text-emerald-700",
  MODIFICADO: "bg-violet-100 text-violet-700",
  RESCINDIDO: "bg-red-100 text-red-700",
};

const fmtMoney = (n: number, c = "BOB") =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "2-digit" });

const createSchema = z.object({
  reservationId: z.string().uuid("Seleccione una reserva"),
  totalAmount: z.coerce.number().min(0.01),
  currency: z.enum(["BOB", "USD"]),
  deliveryDeadline: z.string().min(1, "Fecha requerida"),
});
type CreateForm = z.infer<typeof createSchema>;

export default function ContratosPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = React.useState<ContractStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = React.useState(false);

  const contractsQ = useQuery({ queryKey: ["contracts"], queryFn: contractsApi.list });
  const reservationsQ = useQuery({ queryKey: ["reservations"], queryFn: reservationsApi.list });
  const propsQ = useQuery({ queryKey: ["properties"], queryFn: propertiesApi.list });
  const clientsQ = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });

  const propMap = React.useMemo(() => Object.fromEntries((propsQ.data ?? []).map((p) => [p.id, p])), [propsQ.data]);
  const clientMap = React.useMemo(() => Object.fromEntries((clientsQ.data ?? []).map((c) => [c.id, c])), [clientsQ.data]);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["contracts"] });
    qc.invalidateQueries({ queryKey: ["reservations"] });
    qc.invalidateQueries({ queryKey: ["properties"] });
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["dash"] });
  };

  const createMut = useMutation({
    mutationFn: (d: CreateForm) => contractsApi.create({
      reservationId: d.reservationId,
      totalAmount: d.totalAmount,
      currency: d.currency,
      deliveryDeadline: new Date(d.deliveryDeadline).toISOString(),
    }),
    onSuccess: () => { invalidateAll(); toast.success("Contrato BORRADOR creado"); setCreateOpen(false); },
    onError: (e) => toast.error("Error al crear", { description: extractApiError(e) }),
  });

  const reviewMut = useMutation({
    mutationFn: (id: string) => contractsApi.submitReview(id),
    onSuccess: () => { invalidateAll(); toast.success("Contrato enviado a revisión"); },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const signMut = useMutation({
    mutationFn: (id: string) => contractsApi.sign(id),
    onSuccess: () => { invalidateAll(); toast.success("Contrato firmado · cascada de estados aplicada"); },
    onError: (e) => toast.error("Error al firmar", { description: extractApiError(e) }),
  });

  const rescindMut = useMutation({
    mutationFn: (id: string) => contractsApi.rescind(id),
    onSuccess: () => { invalidateAll(); toast.success("Contrato rescindido"); },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const items: Contract[] = contractsQ.data ?? [];
  const filtered = filter === "ALL" ? items : items.filter((c) => c.status === filter);

  const activeReservations = (reservationsQ.data ?? []).filter((r) => r.status === "ACTIVA");

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-5 p-6 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              § Contratos · {items.length} totales · {items.filter((c) => c.status === "FIRMADO").length} firmados
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
              <FileSignature className="h-7 w-7 text-indigo-600" />
              Contratos
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Flujo BORRADOR → REVISION → FIRMADO. Firma dispara cascada de estados (Property VENDIDO + Client FIRMADO + Reserva CONVERTIDA).
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => contractsQ.refetch()} disabled={contractsQ.isFetching}>
              <RefreshCw className={contractsQ.isFetching ? "animate-spin" : ""} />
              Recargar
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} disabled={activeReservations.length === 0}>
              <Plus />
              Nuevo contrato
            </Button>
          </div>
        </header>

        {activeReservations.length === 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            No hay reservas ACTIVAS. Para crear un contrato, primero crea una reserva.
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {(["ALL", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                filter === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {s === "ALL" ? `Todos · ${items.length}` : `${s} · ${items.filter((c) => c.status === s).length}`}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {contractsQ.isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">Sin contratos.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inmueble</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Firmado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-32">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const prop = propMap[c.propertyId];
                  const client = clientMap[c.clientId];
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="text-sm font-bold text-slate-900">{prop?.code ?? c.propertyId.slice(0, 8)}</div>
                        <div className="text-xs text-slate-500">{prop?.address ?? "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{client ? `${client.firstName} ${client.lastName}` : "—"}</div>
                        <div className="font-mono text-xs text-slate-500">CI {client?.ci ?? "—"}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {fmtMoney(Number(c.totalAmount), c.currency)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{fmtDate(c.deliveryDeadline)}</TableCell>
                      <TableCell className="font-mono text-xs">{c.signedDate ? fmtDate(c.signedDate) : "—"}</TableCell>
                      <TableCell>
                        <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${color[c.status]}`}>{c.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {c.status === "BORRADOR" && (
                            <Button variant="ghost" size="sm" title="Enviar a revisión" disabled={reviewMut.isPending} onClick={() => reviewMut.mutate(c.id)}>
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {c.status === "REVISION" && (
                            <Button variant="ghost" size="sm" title="Firmar" disabled={signMut.isPending} onClick={() => {
                              if (confirm("Firmar contrato? Aplicará cascada: Property→VENDIDO, Client→FIRMADO, Reserva→CONVERTIDA.")) signMut.mutate(c.id);
                            }}>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                          )}
                          {c.status === "FIRMADO" && (
                            <Button variant="ghost" size="sm" title="Rescindir" disabled={rescindMut.isPending} onClick={() => {
                              if (confirm("¿Rescindir contrato firmado?")) rescindMut.mutate(c.id);
                            }}>
                              <XCircle className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <CreateContractDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        reservations={activeReservations.map((r) => ({
          id: r.id,
          label: `${propMap[r.propertyId]?.code ?? r.propertyId.slice(0, 8)} · ${
            clientMap[r.clientId]
              ? `${clientMap[r.clientId].firstName} ${clientMap[r.clientId].lastName}`
              : "—"
          } · depósito ${fmtMoney(Number(r.depositAmount), r.currency)}`,
        }))}
        onSubmit={(d) => createMut.mutate(d)}
        isLoading={createMut.isPending}
      />
    </div>
  );
}

function CreateContractDialog({
  open, onOpenChange, reservations, onSubmit, isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reservations: Array<{ id: string; label: string }>;
  onSubmit: (d: CreateForm) => void;
  isLoading: boolean;
}) {
  const defaultDeadline = React.useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    return d.toISOString().slice(0, 10);
  }, []);

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { reservationId: "", totalAmount: 100000, currency: "BOB", deliveryDeadline: defaultDeadline },
  });

  React.useEffect(() => {
    if (open) form.reset({ reservationId: "", totalAmount: 100000, currency: "BOB", deliveryDeadline: defaultDeadline });
  }, [open, form, defaultDeadline]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo contrato</DialogTitle>
          <DialogDescription>Se creará en estado BORRADOR a partir de una reserva activa.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Reserva activa</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("reservationId")}>
              <option value="">— Seleccionar —</option>
              {reservations.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            {form.formState.errors.reservationId && <p className="mt-1 text-xs text-destructive">{form.formState.errors.reservationId.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Monto total</Label>
              <Input type="number" step="0.01" {...form.register("totalAmount")} />
              {form.formState.errors.totalAmount && <p className="mt-1 text-xs text-destructive">{form.formState.errors.totalAmount.message}</p>}
            </div>
            <div>
              <Label>Moneda</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("currency")}>
                <option value="BOB">BOB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Fecha de entrega</Label>
            <Input type="date" {...form.register("deliveryDeadline")} />
            {form.formState.errors.deliveryDeadline && <p className="mt-1 text-xs text-destructive">{form.formState.errors.deliveryDeadline.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Crear borrador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
