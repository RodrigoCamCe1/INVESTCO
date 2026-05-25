"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft, Layers3, Loader2, MapPin, Plus, FileSignature,
  CheckCircle2, XCircle, Hammer, Building2, ShoppingBag, ClipboardCheck,
  AlertTriangle, FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  developmentsApi, acquisitionsApi, permitsApi, constructionApi, usersApi,
} from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";
import type {
  AcquisitionStatus, DevelopmentStatus, PermitStatus, PermitType,
} from "@/lib/api/types";

const statusOrder: DevelopmentStatus[] = [
  "PLANIFICACION", "ADQUISICION", "PERMISOS", "EN_CONSTRUCCION", "COMERCIALIZACION", "COMPLETADO",
];
const statusLabel: Record<DevelopmentStatus, string> = {
  PLANIFICACION: "Planificación",
  ADQUISICION: "Adquisición",
  PERMISOS: "Permisos",
  EN_CONSTRUCCION: "En construcción",
  COMERCIALIZACION: "Comercialización",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};
const statusColor: Record<DevelopmentStatus, string> = {
  PLANIFICACION: "bg-slate-100 text-slate-700",
  ADQUISICION: "bg-blue-100 text-blue-700",
  PERMISOS: "bg-yellow-100 text-yellow-800",
  EN_CONSTRUCCION: "bg-amber-100 text-amber-800",
  COMERCIALIZACION: "bg-indigo-100 text-indigo-700",
  COMPLETADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};

const acqColor: Record<AcquisitionStatus, string> = {
  NEGOCIACION: "bg-blue-100 text-blue-700",
  FIRMADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};
const permitColor: Record<PermitStatus, string> = {
  GESTIONANDO: "bg-blue-100 text-blue-700",
  APROBADO: "bg-emerald-100 text-emerald-700",
  RECHAZADO: "bg-red-100 text-red-700",
  VENCIDO: "bg-orange-100 text-orange-700",
};
const PERMIT_TYPES: PermitType[] = ["MUNICIPAL", "BOMBEROS", "AMBIENTAL", "CATASTRAL", "SERVICIOS"];

const fmtMoney = (n: number, c = "BOB") =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

export default function DesarrolloDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const qc = useQueryClient();

  const devQ = useQuery({
    queryKey: ["development", id],
    queryFn: () => developmentsApi.get(id),
    enabled: !!id && id.length === 36,
    refetchOnMount: true,
  });

  const advanceMut = useMutation({
    mutationFn: (status: DevelopmentStatus) => developmentsApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["development", id] });
      qc.invalidateQueries({ queryKey: ["developments"] });
      toast.success("Estado actualizado");
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  if (id.length !== 36) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-3xl p-8">
          <Link href="/desarrollos" className="font-mono text-xs text-slate-500">
            <ArrowLeft className="inline h-3 w-3" /> Desarrollos
          </Link>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            ID inválido.
          </div>
        </div>
      </div>
    );
  }

  if (devQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando desarrollo…
      </div>
    );
  }

  if (devQ.error || !devQ.data) {
    return (
      <div className="bg-slate-50 p-8">
        <Link href="/desarrollos" className="font-mono text-xs text-slate-500">
          <ArrowLeft className="inline h-3 w-3" /> Desarrollos
        </Link>
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {extractApiError(devQ.error, "Desarrollo no encontrado")}
        </div>
      </div>
    );
  }

  const dev = devQ.data;
  const currentIdx = statusOrder.indexOf(dev.status);
  const isTerminal = dev.status === "COMPLETADO" || dev.status === "CANCELADO";

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-5 p-6 md:p-8">
        <Link href="/desarrollos" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3 w-3" /> Desarrollos
        </Link>

        {/* HEADER */}
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">{dev.code}</p>
              <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
                <Layers3 className="h-7 w-7 text-indigo-600" />
                {dev.name}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {dev.zone} · {dev.address}
              </p>
              {dev.description && <p className="mt-1 text-sm text-slate-600">{dev.description}</p>}
            </div>
            <div className="text-right">
              <Badge className={`font-mono text-[10px] font-bold uppercase tracking-widest ${statusColor[dev.status]}`}>
                {statusLabel[dev.status]}
              </Badge>
            </div>
          </div>

          {/* STAGE PROGRESS */}
          <div className="mt-5">
            <div className="grid grid-cols-6 gap-1">
              {statusOrder.map((s, i) => {
                const isPast = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div
                    key={s}
                    className={`rounded-md px-2 py-2 text-center font-mono text-[9px] font-bold uppercase tracking-widest ${
                      dev.status === "CANCELADO"
                        ? "bg-slate-100 text-slate-400"
                        : isCurrent
                          ? "bg-amber-500 text-white shadow-md"
                          : isPast
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {statusLabel[s]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION */}
          {!isTerminal && currentIdx < statusOrder.length - 1 && (
            <div className="mt-4 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/50 px-4 py-3">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-800">
                  Próximo paso
                </div>
                <p className="mt-0.5 text-sm text-slate-700">
                  {dev.status === "PLANIFICACION" && "Registrar adquisición del terreno"}
                  {dev.status === "ADQUISICION" && "Firmar contrato de adquisición"}
                  {dev.status === "PERMISOS" && "Aprobar permiso municipal y crear proyecto de construcción"}
                  {dev.status === "EN_CONSTRUCCION" && "Avanzar obra hasta finalización"}
                  {dev.status === "COMERCIALIZACION" && "Subdividir y vender unidades a clientes"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={advanceMut.isPending}
                  onClick={() => {
                    const next = statusOrder[currentIdx + 1];
                    if (next && confirm(`Avanzar a ${statusLabel[next]}?`)) advanceMut.mutate(next);
                  }}
                >
                  Avanzar manualmente →
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* TABS */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="general" className="font-mono text-[10px] font-bold uppercase tracking-widest">
              General
            </TabsTrigger>
            <TabsTrigger value="adquisicion" className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Adquisición
            </TabsTrigger>
            <TabsTrigger value="permisos" className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Permisos
            </TabsTrigger>
            <TabsTrigger value="construccion" className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Construcción
            </TabsTrigger>
            <TabsTrigger value="unidades" className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Unidades
            </TabsTrigger>
            <TabsTrigger value="comercial" className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Comercial
            </TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Panel title="Presupuestos">
                <dl className="space-y-3 text-sm">
                  <Row label="Adquisición terreno">{fmtMoney(Number(dev.acquisitionBudget), dev.currency)}</Row>
                  <Row label="Construcción">{fmtMoney(Number(dev.constructionBudget), dev.currency)}</Row>
                  <Row label="Total proyecto" bold>
                    {fmtMoney(Number(dev.acquisitionBudget) + Number(dev.constructionBudget), dev.currency)}
                  </Row>
                  <Row label="Moneda">{dev.currency}</Row>
                </dl>
              </Panel>
              <Panel title="Fechas y unidades">
                <dl className="space-y-3 text-sm">
                  <Row label="Inicio">{fmtDate(dev.startDate)}</Row>
                  <Row label="Entrega prevista">{fmtDate(dev.estimatedCompletion)}</Row>
                  <Row label="Unidades estimadas">{dev.estimatedUnits}</Row>
                  <Row label="Unidades actuales">{dev.units?.length ?? 0}</Row>
                </dl>
              </Panel>
            </div>
          </TabsContent>

          {/* ADQUISICION */}
          <TabsContent value="adquisicion" className="mt-4">
            <AcquisitionsTab developmentId={id} />
          </TabsContent>

          {/* PERMISOS */}
          <TabsContent value="permisos" className="mt-4">
            <PermitsTab developmentId={id} />
          </TabsContent>

          {/* CONSTRUCCION */}
          <TabsContent value="construccion" className="mt-4">
            <ConstructionTab developmentId={id} dev={dev} />
          </TabsContent>

          {/* UNIDADES */}
          <TabsContent value="unidades" className="mt-4">
            <UnitsTab dev={dev} />
          </TabsContent>

          {/* COMERCIAL */}
          <TabsContent value="comercial" className="mt-4">
            <CommercialTab dev={dev} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENTS
// =========================================================================

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="text-sm font-black tracking-tight text-slate-900">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function Row({ label, children, bold }: { label: string; children: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</dt>
      <dd className={`text-sm ${bold ? "font-black text-slate-900" : "text-slate-700"} tabular-nums`}>{children}</dd>
    </div>
  );
}

// === ACQUISITIONS TAB ===
const acquisitionSchema = z.object({
  sellerName: z.string().min(3),
  sellerCi: z.string().optional(),
  sellerPhone: z.string().optional(),
  totalAmount: z.coerce.number().min(0.01),
  currency: z.enum(["BOB", "USD"]),
  notes: z.string().optional(),
});
type AcqForm = z.infer<typeof acquisitionSchema>;

function AcquisitionsTab({ developmentId }: { developmentId: string }) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);

  const listQ = useQuery({
    queryKey: ["acquisitions", developmentId],
    queryFn: () => acquisitionsApi.list(developmentId),
  });

  const createMut = useMutation({
    mutationFn: (d: AcqForm) => acquisitionsApi.create(developmentId, {
      sellerName: d.sellerName,
      sellerCi: d.sellerCi || undefined,
      sellerPhone: d.sellerPhone || undefined,
      totalAmount: d.totalAmount,
      currency: d.currency,
      notes: d.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["acquisitions", developmentId] });
      qc.invalidateQueries({ queryKey: ["development", developmentId] });
      toast.success("Adquisición creada");
      setCreateOpen(false);
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const signMut = useMutation({
    mutationFn: (id: string) => acquisitionsApi.sign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["acquisitions", developmentId] });
      qc.invalidateQueries({ queryKey: ["development", developmentId] });
      qc.invalidateQueries({ queryKey: ["developments"] });
      toast.success("Adquisición firmada · desarrollo avanza a PERMISOS");
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => acquisitionsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["acquisitions", developmentId] });
      toast.success("Adquisición cancelada");
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const items = listQ.data ?? [];

  return (
    <Panel
      title="Contratos de adquisición del terreno"
      action={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />Nueva
        </Button>
      }
    >
      {listQ.isLoading ? (
        <div className="py-6 text-center text-slate-500"><Loader2 className="inline h-4 w-4 animate-spin" /></div>
      ) : items.length === 0 ? (
        <EmptyTab msg="Sin contratos de adquisición todavía." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileSignature className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-900">{a.sellerName}</span>
                  <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${acqColor[a.status]}`}>{a.status}</Badge>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  {a.sellerCi ? `CI ${a.sellerCi} · ` : ""}{a.sellerPhone ?? ""}{a.notes ? ` · ${a.notes}` : ""}
                </div>
                {a.signedDate && (
                  <div className="mt-0.5 font-mono text-[10px] text-emerald-700">Firmado {fmtDate(a.signedDate)}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black tabular-nums text-slate-900">
                  {fmtMoney(Number(a.totalAmount), a.currency)}
                </span>
                <div className="flex gap-1">
                  {a.status === "NEGOCIACION" && (
                    <>
                      <Button size="sm" variant="ghost" disabled={signMut.isPending} onClick={() => {
                        if (confirm("¿Firmar? El desarrollo avanzará a PERMISOS.")) signMut.mutate(a.id);
                      }}>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </Button>
                      <Button size="sm" variant="ghost" disabled={cancelMut.isPending} onClick={() => {
                        if (confirm("¿Cancelar?")) cancelMut.mutate(a.id);
                      }}>
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva adquisición</DialogTitle>
            <DialogDescription>Contrato con vendedor del terreno.</DialogDescription>
          </DialogHeader>
          <AcqForm onSubmit={(d) => createMut.mutate(d)} isLoading={createMut.isPending} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function AcqForm({ onSubmit, isLoading, onCancel }: { onSubmit: (d: AcqForm) => void; isLoading: boolean; onCancel: () => void }) {
  const form = useForm<AcqForm>({
    resolver: zodResolver(acquisitionSchema),
    defaultValues: { sellerName: "", totalAmount: 100000, currency: "BOB" },
  });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label>Vendedor</Label>
        <Input placeholder="Inmobiliaria / persona" {...form.register("sellerName")} />
        {form.formState.errors.sellerName && <p className="mt-1 text-xs text-destructive">{form.formState.errors.sellerName.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>CI / NIT (opt)</Label><Input {...form.register("sellerCi")} /></div>
        <div><Label>Teléfono (opt)</Label><Input {...form.register("sellerPhone")} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2"><Label>Monto</Label><Input type="number" step="0.01" {...form.register("totalAmount")} /></div>
        <div>
          <Label>Moneda</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("currency")}>
            <option value="BOB">BOB</option><option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div><Label>Notas (opt)</Label><Input {...form.register("notes")} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin" />}Crear</Button>
      </DialogFooter>
    </form>
  );
}

// === PERMITS TAB ===
const permitSchema = z.object({
  type: z.enum(PERMIT_TYPES as [string, ...string[]]),
  permitNumber: z.string().optional(),
  issuedDate: z.string().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});
type PermitForm = z.infer<typeof permitSchema>;

function PermitsTab({ developmentId }: { developmentId: string }) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);

  const listQ = useQuery({
    queryKey: ["permits", developmentId],
    queryFn: () => permitsApi.list(developmentId),
  });

  const createMut = useMutation({
    mutationFn: (d: PermitForm) => permitsApi.create(developmentId, {
      type: d.type as PermitType,
      permitNumber: d.permitNumber || undefined,
      issuedDate: d.issuedDate ? new Date(d.issuedDate).toISOString() : undefined,
      validUntil: d.validUntil ? new Date(d.validUntil).toISOString() : undefined,
      notes: d.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["permits", developmentId] });
      qc.invalidateQueries({ queryKey: ["development", developmentId] });
      toast.success("Permiso registrado");
      setCreateOpen(false);
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PermitStatus }) =>
      permitsApi.update(id, { status, issuedDate: status === "APROBADO" ? new Date().toISOString() : undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["permits", developmentId] });
      qc.invalidateQueries({ queryKey: ["development", developmentId] });
      toast.success("Permiso actualizado");
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const items = listQ.data ?? [];

  return (
    <Panel
      title="Permisos municipales y regulatorios"
      action={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />Nuevo
        </Button>
      }
    >
      {listQ.isLoading ? (
        <div className="py-6 text-center text-slate-500"><Loader2 className="inline h-4 w-4 animate-spin" /></div>
      ) : items.length === 0 ? (
        <EmptyTab msg="Sin permisos registrados. Municipal es obligatorio para iniciar construcción." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-900">{p.type}</span>
                  <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${permitColor[p.status]}`}>{p.status}</Badge>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  {p.permitNumber ? `N° ${p.permitNumber}` : "sin número"}
                  {p.issuedDate ? ` · emitido ${fmtDate(p.issuedDate)}` : ""}
                  {p.validUntil ? ` · vence ${fmtDate(p.validUntil)}` : ""}
                </div>
                {p.notes && <p className="mt-1 text-xs text-slate-600">{p.notes}</p>}
              </div>
              <div className="flex gap-1">
                {p.status === "GESTIONANDO" && (
                  <>
                    <Button size="sm" variant="ghost" disabled={updateMut.isPending} onClick={() => updateMut.mutate({ id: p.id, status: "APROBADO" })}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </Button>
                    <Button size="sm" variant="ghost" disabled={updateMut.isPending} onClick={() => updateMut.mutate({ id: p.id, status: "RECHAZADO" })}>
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo permiso</DialogTitle>
            <DialogDescription>Trámite municipal / regulatorio.</DialogDescription>
          </DialogHeader>
          <PermitFormCmp onSubmit={(d) => createMut.mutate(d)} isLoading={createMut.isPending} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function PermitFormCmp({ onSubmit, isLoading, onCancel }: { onSubmit: (d: PermitForm) => void; isLoading: boolean; onCancel: () => void }) {
  const form = useForm<PermitForm>({
    resolver: zodResolver(permitSchema),
    defaultValues: { type: "MUNICIPAL" },
  });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label>Tipo</Label>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("type")}>
          {PERMIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <Label>Número de permiso (opt)</Label>
        <Input placeholder="M-2026-001" {...form.register("permitNumber")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Emisión (opt)</Label><Input type="date" {...form.register("issuedDate")} /></div>
        <div><Label>Vigencia hasta (opt)</Label><Input type="date" {...form.register("validUntil")} /></div>
      </div>
      <div><Label>Notas (opt)</Label><Input {...form.register("notes")} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin" />}Crear</Button>
      </DialogFooter>
    </form>
  );
}

// === CONSTRUCTION TAB ===
const cmSchema = z.object({
  code: z.string().min(3),
  startDate: z.string().min(1),
  projectManagerId: z.string().uuid(),
  qualityManagerId: z.string().optional(),
  budgetManagerId: z.string().optional(),
});
type CMForm = z.infer<typeof cmSchema>;

function ConstructionTab({ developmentId, dev }: { developmentId: string; dev: { projects?: Array<{ id: string; code: string; kind: string; status: string; currentStage: string; startDate: string; endDate: string | null }>; acquisitionContracts?: Array<{ status: string }>; permits?: Array<{ status: string; type: string }> } }) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);

  const masterProject = (dev.projects ?? []).find((p) => p.kind === "CONSTRUCTION_MASTER");
  const hasSignedAcq = (dev.acquisitionContracts ?? []).some((a) => a.status === "FIRMADO");
  const hasApprovedMunicipal = (dev.permits ?? []).some((p) => p.status === "APROBADO" && p.type === "MUNICIPAL");
  const canCreate = hasSignedAcq && hasApprovedMunicipal && !masterProject;

  const pmUsersQ = useQuery({ queryKey: ["users", "ENCARG_PROYECTO"], queryFn: () => usersApi.list("ENCARG_PROYECTO") });
  const qmUsersQ = useQuery({ queryKey: ["users", "ENCARG_CALIDAD"], queryFn: () => usersApi.list("ENCARG_CALIDAD") });
  const bmUsersQ = useQuery({ queryKey: ["users", "ENCARG_PRESUPUESTO"], queryFn: () => usersApi.list("ENCARG_PRESUPUESTO") });

  const createMut = useMutation({
    mutationFn: (d: CMForm) => constructionApi.create(developmentId, {
      code: d.code,
      startDate: new Date(d.startDate).toISOString(),
      projectManagerId: d.projectManagerId,
      qualityManagerId: d.qualityManagerId || undefined,
      budgetManagerId: d.budgetManagerId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["development", developmentId] });
      qc.invalidateQueries({ queryKey: ["developments"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Proyecto de construcción creado");
      setCreateOpen(false);
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  const finalizeMut = useMutation({
    mutationFn: (projectId: string) => constructionApi.finalize(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["development", developmentId] });
      qc.invalidateQueries({ queryKey: ["developments"] });
      toast.success("Obra finalizada · desarrollo avanza a COMERCIALIZACION");
    },
    onError: (e) => toast.error("Error", { description: extractApiError(e) }),
  });

  return (
    <Panel
      title="Proyecto de construcción del edificio"
      action={!masterProject && (
        <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!canCreate}>
          <Plus />Crear obra
        </Button>
      )}
    >
      {!masterProject && (
        <>
          <div className="space-y-2">
            <Requirement met={hasSignedAcq} label="Al menos una adquisición de terreno FIRMADA" />
            <Requirement met={hasApprovedMunicipal} label="Permiso MUNICIPAL APROBADO" />
          </div>
          <EmptyTab msg="Cumple ambos requisitos antes de crear el proyecto de construcción." />
        </>
      )}

      {masterProject && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-amber-600" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">{masterProject.code}</span>
                  <Badge className="bg-amber-100 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-800">{masterProject.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-700">Etapa actual: <strong>{masterProject.currentStage}</strong></p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Inicio {fmtDate(masterProject.startDate)}
                  {masterProject.endDate ? ` · finalizó ${fmtDate(masterProject.endDate)}` : ""}
                </p>
              </div>
              {masterProject.status !== "FINALIZADO" && (
                <Button size="sm" variant="outline" disabled={finalizeMut.isPending} onClick={() => {
                  if (confirm("¿Finalizar construcción? Desarrollo pasará a COMERCIALIZACION.")) finalizeMut.mutate(masterProject.id);
                }}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />Finalizar
                </Button>
              )}
            </div>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Activities, calidad y compras se gestionan dentro del proyecto (UI futura).
          </p>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar proyecto de construcción</DialogTitle>
            <DialogDescription>El desarrollo avanzará a EN_CONSTRUCCION.</DialogDescription>
          </DialogHeader>
          <CMFormCmp
            pmUsers={pmUsersQ.data ?? []}
            qmUsers={qmUsersQ.data ?? []}
            bmUsers={bmUsersQ.data ?? []}
            onSubmit={(d) => createMut.mutate(d)}
            isLoading={createMut.isPending}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function CMFormCmp({
  pmUsers, qmUsers, bmUsers, onSubmit, isLoading, onCancel,
}: {
  pmUsers: Array<{ id: string; fullName: string; email: string }>;
  qmUsers: Array<{ id: string; fullName: string; email: string }>;
  bmUsers: Array<{ id: string; fullName: string; email: string }>;
  onSubmit: (d: CMForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const form = useForm<CMForm>({
    resolver: zodResolver(cmSchema),
    defaultValues: { code: "", startDate: today, projectManagerId: "" },
  });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Código</Label>
          <Input placeholder="PRJ-CM-2026-001" {...form.register("code")} />
          {form.formState.errors.code && <p className="mt-1 text-xs text-destructive">{form.formState.errors.code.message}</p>}
        </div>
        <div><Label>Inicio</Label><Input type="date" {...form.register("startDate")} /></div>
      </div>
      <div>
        <Label>Encargado de proyecto *</Label>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("projectManagerId")}>
          <option value="">— Seleccionar —</option>
          {pmUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
        </select>
        {form.formState.errors.projectManagerId && <p className="mt-1 text-xs text-destructive">Requerido</p>}
      </div>
      <div>
        <Label>Encargado de calidad (opt)</Label>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("qualityManagerId")}>
          <option value="">— Sin asignar —</option>
          {qmUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
        </select>
      </div>
      <div>
        <Label>Encargado de presupuesto (opt)</Label>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("budgetManagerId")}>
          <option value="">— Sin asignar —</option>
          {bmUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
        </select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin" />}Crear obra</Button>
      </DialogFooter>
    </form>
  );
}

// === UNITS TAB ===
const bulkSchema = z.object({
  count: z.coerce.number().int().min(1).max(200),
  codePrefix: z.string().min(1, "Prefijo requerido"),
  type: z.enum(["LOTE", "CASA", "DEPTO", "DUPLEX"]),
  m2: z.coerce.number().min(0.01),
  startNumber: z.coerce.number().int().min(1),
});
type BulkForm = z.infer<typeof bulkSchema>;

function UnitsTab({ dev }: { dev: { id: string; estimatedUnits: number; status: string; units?: Array<{ id: string; code: string; type: string; address: string; m2: string; status: string }> } }) {
  const qc = useQueryClient();
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const bulkMut = useMutation({
    mutationFn: (d: BulkForm) => developmentsApi.bulkGenerateUnits(dev.id, {
      count: d.count,
      codePrefix: d.codePrefix,
      type: d.type,
      m2: d.m2,
      startNumber: d.startNumber,
    }),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["development", dev.id] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["dash"] });
      toast.success(`${created.length} unidades generadas`);
      setBulkOpen(false);
    },
    onError: (e) => toast.error("Error al generar", { description: extractApiError(e) }),
  });

  const units = dev.units ?? [];
  const canSubdivide = dev.status === "EN_CONSTRUCCION" || dev.status === "COMERCIALIZACION" || dev.status === "PERMISOS";

  return (
    <Panel
      title={`Unidades del desarrollo (${units.length}/${dev.estimatedUnits})`}
      action={
        <Button size="sm" onClick={() => setBulkOpen(true)} disabled={!canSubdivide}>
          <Plus />Generar unidades
        </Button>
      }
    >
      {!canSubdivide && (
        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-amber-800">
          Subdivisión disponible desde estado PERMISOS en adelante.
        </div>
      )}

      {units.length === 0 ? (
        <EmptyTab msg="Sin unidades. Usá 'Generar unidades' para crear deptos/casas hijas en bulk." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {units.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono text-xs font-bold text-slate-700">{u.code}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{u.type}</span>
                  <Badge className="bg-slate-100 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-700">{u.status}</Badge>
                </div>
                <div className="mt-0.5 text-xs text-slate-600">{u.address}</div>
              </div>
              <div className="font-mono text-xs text-slate-500">{Number(u.m2).toFixed(0)} m²</div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar unidades en bulk</DialogTitle>
            <DialogDescription>
              Crea N propiedades hijas con códigos secuenciales. Cada una queda DISPONIBLE y vinculada al desarrollo.
            </DialogDescription>
          </DialogHeader>
          <BulkFormCmp
            existingCount={units.length}
            estimatedTotal={dev.estimatedUnits}
            onSubmit={(d) => bulkMut.mutate(d)}
            isLoading={bulkMut.isPending}
            onCancel={() => setBulkOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function BulkFormCmp({
  existingCount, estimatedTotal, onSubmit, isLoading, onCancel,
}: {
  existingCount: number;
  estimatedTotal: number;
  onSubmit: (d: BulkForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const remaining = Math.max(0, estimatedTotal - existingCount);
  const form = useForm<BulkForm>({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      count: Math.min(remaining || estimatedTotal, 12),
      codePrefix: "U",
      type: "DEPTO",
      m2: 80,
      startNumber: existingCount + 1,
    },
  });

  const preview = React.useMemo(() => {
    const c = form.watch("count");
    const prefix = form.watch("codePrefix");
    const start = form.watch("startNumber");
    if (!c || c < 1) return [];
    return Array.from({ length: Math.min(c, 5) }, (_, i) =>
      `${prefix}${String(start + i).padStart(3, "0")}`,
    );
  }, [form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="rounded-md border border-slate-200 bg-slate-50/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-600">
        Estimado del desarrollo: <strong>{estimatedTotal}</strong> · existentes: <strong>{existingCount}</strong> · faltan: <strong>{remaining}</strong>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Cantidad</Label>
          <Input type="number" min={1} max={200} {...form.register("count")} />
          {form.formState.errors.count && <p className="mt-1 text-xs text-destructive">{form.formState.errors.count.message}</p>}
        </div>
        <div>
          <Label>Prefijo</Label>
          <Input placeholder="A / U" {...form.register("codePrefix")} />
          {form.formState.errors.codePrefix && <p className="mt-1 text-xs text-destructive">{form.formState.errors.codePrefix.message}</p>}
        </div>
        <div>
          <Label>N° inicial</Label>
          <Input type="number" min={1} {...form.register("startNumber")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("type")}>
            <option value="DEPTO">DEPTO</option>
            <option value="CASA">CASA</option>
            <option value="DUPLEX">DUPLEX</option>
            <option value="LOTE">LOTE</option>
          </select>
        </div>
        <div>
          <Label>m² por unidad</Label>
          <Input type="number" step="0.01" {...form.register("m2")} />
          {form.formState.errors.m2 && <p className="mt-1 text-xs text-destructive">{form.formState.errors.m2.message}</p>}
        </div>
      </div>
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/40 p-3">
        <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Vista previa códigos</div>
        <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-xs">
          {preview.map((c) => (
            <span key={c} className="rounded bg-white px-2 py-0.5 text-slate-700 border border-slate-200">{c}</span>
          ))}
          {form.watch("count") > 5 && (
            <span className="rounded bg-white px-2 py-0.5 text-slate-500 border border-slate-200">+ {form.watch("count") - 5} más…</span>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin" />}Generar</Button>
      </DialogFooter>
    </form>
  );
}

// === COMMERCIAL TAB ===
function CommercialTab({ dev }: { dev: { projects?: Array<{ id: string; code: string; kind: string; status: string; currentStage: string; property?: { code: string; address: string } | null }> } }) {
  const unitProjects = (dev.projects ?? []).filter((p) => p.kind === "UNIT_SALE");
  return (
    <Panel title="Comercialización de unidades">
      {unitProjects.length === 0 ? (
        <EmptyTab msg="Aún no hay ventas de unidades. Crea reservas y contratos para que sus proyectos aparezcan acá." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {unitProjects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">{p.code}</span>
                  <Badge className="bg-indigo-100 font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-700">{p.status}</Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-800">{p.property?.address ?? "—"}</p>
              </div>
              <Link href={`/proyectos/${p.id}`} className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900">
                Ver →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// === SHARED ===
function EmptyTab({ msg }: { msg: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center text-sm text-slate-500">
      {msg}
    </div>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${met ? "border-emerald-200 bg-emerald-50/40 text-emerald-800" : "border-slate-200 bg-slate-50/40 text-slate-500"}`}>
      {met ? <ClipboardCheck className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
      {label}
    </div>
  );
}
