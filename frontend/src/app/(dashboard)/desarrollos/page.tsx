"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Layers3, Plus, RefreshCw, Loader2, ArrowUpRight, MapPin, Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { developmentsApi } from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";
import type { Development, DevelopmentStatus } from "@/lib/api/types";

const STATUSES: DevelopmentStatus[] = [
  "PLANIFICACION", "ADQUISICION", "PERMISOS", "EN_CONSTRUCCION", "COMERCIALIZACION", "COMPLETADO", "CANCELADO",
];

const statusColor: Record<DevelopmentStatus, string> = {
  PLANIFICACION: "bg-slate-100 text-slate-700",
  ADQUISICION: "bg-blue-100 text-blue-700",
  PERMISOS: "bg-yellow-100 text-yellow-800",
  EN_CONSTRUCCION: "bg-amber-100 text-amber-800",
  COMERCIALIZACION: "bg-indigo-100 text-indigo-700",
  COMPLETADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};

const statusLabel: Record<DevelopmentStatus, string> = {
  PLANIFICACION: "Planificación",
  ADQUISICION: "Adquisición",
  PERMISOS: "Permisos",
  EN_CONSTRUCCION: "En construcción",
  COMERCIALIZACION: "Comercialización",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const STATUS_PROGRESS: Record<DevelopmentStatus, number> = {
  PLANIFICACION: 10,
  ADQUISICION: 25,
  PERMISOS: 45,
  EN_CONSTRUCCION: 70,
  COMERCIALIZACION: 90,
  COMPLETADO: 100,
  CANCELADO: 0,
};

const createSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  zone: z.string().min(2),
  address: z.string().min(3),
  description: z.string().optional(),
  acquisitionBudget: z.coerce.number().min(0.01),
  constructionBudget: z.coerce.number().min(0.01),
  currency: z.enum(["BOB", "USD"]),
  estimatedUnits: z.coerce.number().int().min(1),
  startDate: z.string().min(1),
  estimatedCompletion: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

const fmtMoney = (n: number, c = "BOB") =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "2-digit" });

export default function DesarrollosPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = React.useState<DevelopmentStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = React.useState(false);

  const devsQ = useQuery({ queryKey: ["developments"], queryFn: () => developmentsApi.list() });

  const createMut = useMutation({
    mutationFn: (d: CreateForm) => developmentsApi.create({
      code: d.code,
      name: d.name,
      zone: d.zone,
      address: d.address,
      description: d.description || undefined,
      acquisitionBudget: d.acquisitionBudget,
      constructionBudget: d.constructionBudget,
      currency: d.currency,
      estimatedUnits: d.estimatedUnits,
      startDate: new Date(d.startDate).toISOString(),
      estimatedCompletion: d.estimatedCompletion ? new Date(d.estimatedCompletion).toISOString() : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["developments"] });
      toast.success("Desarrollo creado en PLANIFICACION");
      setCreateOpen(false);
    },
    onError: (e) => toast.error("Error al crear", { description: extractApiError(e) }),
  });

  const items: Development[] = devsQ.data ?? [];
  const filtered = filter === "ALL" ? items : items.filter((d) => d.status === filter);

  const activeCount = items.filter((d) => !["COMPLETADO", "CANCELADO"].includes(d.status)).length;
  const totalBudget = items.reduce((acc, d) => acc + Number(d.acquisitionBudget) + Number(d.constructionBudget), 0);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-5 p-6 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              § Desarrollos · {items.length} totales · {activeCount} activos
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
              <Layers3 className="h-7 w-7 text-indigo-600" />
              Desarrollos inmobiliarios
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Edificios y condominios completos. Desde adquisición de terreno hasta entrega de última unidad.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => devsQ.refetch()} disabled={devsQ.isFetching}>
              <RefreshCw className={devsQ.isFetching ? "animate-spin" : ""} />
              Recargar
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              Nuevo desarrollo
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
              {s === "ALL" ? `Todos · ${items.length}` : `${statusLabel[s as DevelopmentStatus]} · ${items.filter((d) => d.status === s).length}`}
            </button>
          ))}
        </div>

        {/* KPI strip */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiMini label="Desarrollos activos" value={String(activeCount)} accent="indigo" />
            <KpiMini label="Unidades estimadas" value={String(items.reduce((acc, d) => acc + d.estimatedUnits, 0))} accent="amber" />
            <KpiMini label="Presupuesto total" value={fmtMoney(totalBudget)} accent="emerald" />
            <KpiMini label="En construcción" value={String(items.filter((d) => d.status === "EN_CONSTRUCCION").length)} accent="violet" />
          </div>
        )}

        {devsQ.isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-slate-500 shadow-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white/50 p-10 text-center">
            <Layers3 className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Sin desarrollos {filter !== "ALL" ? `en ${filter}` : ""}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {filter === "ALL" ? "Crea el primer desarrollo para arrancar el ciclo completo." : "Cambia el filtro o crea uno nuevo."}
            </p>
            {filter === "ALL" && (
              <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
                <Plus />Nuevo desarrollo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => {
              const pct = STATUS_PROGRESS[d.status];
              return (
                <Link
                  key={d.id}
                  href={`/desarrollos/${d.id}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">{d.code}</p>
                      <h3 className="mt-1 truncate text-base font-black tracking-tight text-slate-900">{d.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {d.zone}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700" />
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${statusColor[d.status]}`}>{statusLabel[d.status]}</Badge>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                      <span className="text-slate-500">Avance ciclo</span>
                      <span className="font-black text-slate-900">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-2 rounded-full transition-all ${d.status === "CANCELADO" ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-amber-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                    <Stat icon={Building} label="Unidades" value={String(d.estimatedUnits)} />
                    <Stat label="Adq." value={fmtMoney(Number(d.acquisitionBudget), d.currency)} compact />
                    <Stat label="Obra" value={fmtMoney(Number(d.constructionBudget), d.currency)} compact />
                  </div>

                  {d._count && (
                    <div className="mt-3 flex gap-3 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                      <span>{d._count.acquisitionContracts} adq</span>
                      <span>·</span>
                      <span>{d._count.permits} permisos</span>
                      <span>·</span>
                      <span>{d._count.projects} obras</span>
                      <span>·</span>
                      <span>{d._count.units} units</span>
                    </div>
                  )}

                  <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    Inicio {fmtDate(d.startDate)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CreateDevDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={(d) => createMut.mutate(d)} isLoading={createMut.isPending} />
    </div>
  );
}

function KpiMini({ label, value, accent }: { label: string; value: string; accent: "indigo" | "amber" | "emerald" | "violet" }) {
  const map = {
    indigo: "border-indigo-100 bg-indigo-50/40",
    amber: "border-amber-100 bg-amber-50/40",
    emerald: "border-emerald-100 bg-emerald-50/40",
    violet: "border-violet-100 bg-violet-50/40",
  };
  return (
    <div className={`rounded-lg border ${map[accent]} bg-white px-4 py-3`}>
      <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}

function Stat({
  icon: Icon, label, value, compact,
}: { icon?: React.ElementType; label: string; value: string; compact?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className={`mt-0.5 truncate font-bold text-slate-900 ${compact ? "text-[11px]" : "text-sm"} tabular-nums`}>{value}</div>
    </div>
  );
}

function CreateDevDialog({
  open, onOpenChange, onSubmit, isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (d: CreateForm) => void;
  isLoading: boolean;
}) {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      code: "", name: "", zone: "", address: "", description: "",
      acquisitionBudget: 300000, constructionBudget: 1500000, currency: "BOB",
      estimatedUnits: 12, startDate: today, estimatedCompletion: "",
    },
  });

  React.useEffect(() => {
    if (open) form.reset({
      code: "", name: "", zone: "", address: "", description: "",
      acquisitionBudget: 300000, constructionBudget: 1500000, currency: "BOB",
      estimatedUnits: 12, startDate: today, estimatedCompletion: "",
    });
  }, [open, form, today]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo desarrollo</DialogTitle>
          <DialogDescription>Arranca en PLANIFICACION. Define zona, presupuestos y unidades esperadas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label>Código</Label>
              <Input placeholder="DEV-2026-001" {...form.register("code")} />
              {form.formState.errors.code && <p className="mt-1 text-xs text-destructive">{form.formState.errors.code.message}</p>}
            </div>
            <div className="col-span-2">
              <Label>Nombre comercial</Label>
              <Input placeholder="Condominio Vista Verde" {...form.register("name")} />
              {form.formState.errors.name && <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Zona</Label>
              <Input placeholder="Urubó" {...form.register("zone")} />
              {form.formState.errors.zone && <p className="mt-1 text-xs text-destructive">{form.formState.errors.zone.message}</p>}
            </div>
            <div>
              <Label>Dirección del terreno</Label>
              <Input placeholder="Av. Costanera, lote 12" {...form.register("address")} />
              {form.formState.errors.address && <p className="mt-1 text-xs text-destructive">{form.formState.errors.address.message}</p>}
            </div>
          </div>
          <div>
            <Label>Descripción (opcional)</Label>
            <Input placeholder="Notas, tipo de edificio, etc." {...form.register("description")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label>Presupuesto adquisición</Label>
              <Input type="number" step="1" {...form.register("acquisitionBudget")} />
              {form.formState.errors.acquisitionBudget && <p className="mt-1 text-xs text-destructive">{form.formState.errors.acquisitionBudget.message}</p>}
            </div>
            <div className="col-span-1">
              <Label>Presupuesto construcción</Label>
              <Input type="number" step="1" {...form.register("constructionBudget")} />
              {form.formState.errors.constructionBudget && <p className="mt-1 text-xs text-destructive">{form.formState.errors.constructionBudget.message}</p>}
            </div>
            <div className="col-span-1">
              <Label>Moneda</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("currency")}>
                <option value="BOB">BOB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Unidades estimadas</Label>
              <Input type="number" min={1} {...form.register("estimatedUnits")} />
              {form.formState.errors.estimatedUnits && <p className="mt-1 text-xs text-destructive">{form.formState.errors.estimatedUnits.message}</p>}
            </div>
            <div>
              <Label>Inicio</Label>
              <Input type="date" {...form.register("startDate")} />
            </div>
            <div>
              <Label>Entrega prevista (opt)</Label>
              <Input type="date" {...form.register("estimatedCompletion")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Crear desarrollo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
