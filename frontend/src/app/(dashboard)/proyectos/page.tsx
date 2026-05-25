"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  HardHat, Plus, RefreshCw, Loader2, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  projectsApi, contractsApi, propertiesApi, clientsApi, usersApi,
} from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";
import type { Project, ProjectStatus, ProjectStage } from "@/lib/api/types";

const STATUSES: ProjectStatus[] = ["PLANIFICADO", "EN_EJECUCION", "PAUSADO", "FINALIZADO", "CANCELADO"];
const STAGES: ProjectStage[] = ["PRELIMINARES", "OBRA_BRUTA", "OBRA_FINA", "ENTREGA"];

const statusColor: Record<ProjectStatus, string> = {
  PLANIFICADO: "bg-slate-100 text-slate-700",
  EN_EJECUCION: "bg-amber-100 text-amber-700",
  PAUSADO: "bg-orange-100 text-orange-700",
  FINALIZADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};

const stageProgress: Record<ProjectStage, number> = {
  PRELIMINARES: 15, OBRA_BRUTA: 45, OBRA_FINA: 80, ENTREGA: 100,
};
const stageLabel: Record<ProjectStage, string> = {
  PRELIMINARES: "Preliminares", OBRA_BRUTA: "Obra bruta", OBRA_FINA: "Obra fina", ENTREGA: "Entrega",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "2-digit" });

const createSchema = z.object({
  contractId: z.string().uuid("Seleccione contrato firmado"),
  code: z.string().min(3, "Código mínimo 3 caracteres"),
  startDate: z.string().min(1),
  projectManagerId: z.string().uuid(),
  qualityManagerId: z.string().optional(),
  budgetManagerId: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

export default function ProyectosPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = React.useState<ProjectStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = React.useState(false);

  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const contractsQ = useQuery({ queryKey: ["contracts"], queryFn: contractsApi.list });
  const propsQ = useQuery({ queryKey: ["properties"], queryFn: propertiesApi.list });
  const clientsQ = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });
  const pmUsersQ = useQuery({ queryKey: ["users", "ENCARG_PROYECTO"], queryFn: () => usersApi.list("ENCARG_PROYECTO") });
  const qmUsersQ = useQuery({ queryKey: ["users", "ENCARG_CALIDAD"], queryFn: () => usersApi.list("ENCARG_CALIDAD") });
  const bmUsersQ = useQuery({ queryKey: ["users", "ENCARG_PRESUPUESTO"], queryFn: () => usersApi.list("ENCARG_PRESUPUESTO") });

  const propMap = React.useMemo(() => Object.fromEntries((propsQ.data ?? []).map((p) => [p.id, p])), [propsQ.data]);
  const clientMap = React.useMemo(() => Object.fromEntries((clientsQ.data ?? []).map((c) => [c.id, c])), [clientsQ.data]);
  const contractMap = React.useMemo(() => Object.fromEntries((contractsQ.data ?? []).map((c) => [c.id, c])), [contractsQ.data]);

  const signedContractsWithoutProject = (contractsQ.data ?? []).filter((c) => {
    if (c.status !== "FIRMADO") return false;
    return !(projectsQ.data ?? []).some((p) => p.contractId === c.id);
  });

  const createMut = useMutation({
    mutationFn: (d: CreateForm) => projectsApi.create({
      contractId: d.contractId,
      code: d.code,
      startDate: new Date(d.startDate).toISOString(),
      projectManagerId: d.projectManagerId,
      qualityManagerId: d.qualityManagerId || undefined,
      budgetManagerId: d.budgetManagerId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
      qc.invalidateQueries({ queryKey: ["dash"] });
      toast.success("Proyecto creado · Property → EN_CONSTRUCCION");
      setCreateOpen(false);
    },
    onError: (e) => toast.error("Error al crear proyecto", { description: extractApiError(e) }),
  });

  const items: Project[] = projectsQ.data ?? [];
  const filtered = filter === "ALL" ? items : items.filter((p) => p.status === filter);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-5 p-6 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              § Proyectos · {items.length} totales · {items.filter((p) => p.status === "EN_EJECUCION").length} en ejecución
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
              <HardHat className="h-7 w-7 text-amber-600" />
              Proyectos / Obra
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Cada proyecto se crea desde un contrato firmado. Property pasa a EN_CONSTRUCCION.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => projectsQ.refetch()} disabled={projectsQ.isFetching}>
              <RefreshCw className={projectsQ.isFetching ? "animate-spin" : ""} />
              Recargar
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} disabled={signedContractsWithoutProject.length === 0}>
              <Plus />
              Nuevo proyecto
            </Button>
          </div>
        </header>

        {signedContractsWithoutProject.length === 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Para crear un proyecto necesitas un contrato FIRMADO sin proyecto aún. Firma uno en /contratos.
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
              {s === "ALL" ? `Todos · ${items.length}` : `${s} · ${items.filter((p) => p.status === s).length}`}
            </button>
          ))}
        </div>

        {projectsQ.isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-slate-500 shadow-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Sin proyectos.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const prop = propMap[p.propertyId];
              const contract = contractMap[p.contractId];
              const client = contract ? clientMap[contract.clientId] : null;
              const pct = stageProgress[p.currentStage];
              return (
                <Link
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">{p.code}</p>
                      <h3 className="mt-1 text-base font-black tracking-tight text-slate-900">
                        {prop?.address ?? "Proyecto sin dirección"}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        {prop?.zone ?? "—"} · {prop?.code ?? "—"}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700" />
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${statusColor[p.status]}`}>{p.status}</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {stageLabel[p.currentStage]}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                      <span className="text-slate-500">Avance</span>
                      <span className="font-black text-slate-900">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">Cliente</div>
                      <div className="truncate text-sm text-slate-800">{client ? `${client.firstName} ${client.lastName}` : "—"}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">Inicio</div>
                      <div className="font-mono text-xs text-slate-800">{fmtDate(p.startDate)}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        contracts={signedContractsWithoutProject.map((c) => ({
          id: c.id,
          label: `${propMap[c.propertyId]?.code ?? "—"} · ${clientMap[c.clientId]?.firstName ?? ""} ${clientMap[c.clientId]?.lastName ?? ""}`,
        }))}
        pmUsers={pmUsersQ.data ?? []}
        qmUsers={qmUsersQ.data ?? []}
        bmUsers={bmUsersQ.data ?? []}
        onSubmit={(d) => createMut.mutate(d)}
        isLoading={createMut.isPending}
      />
    </div>
  );
}

function CreateProjectDialog({
  open, onOpenChange, contracts, pmUsers, qmUsers, bmUsers, onSubmit, isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contracts: Array<{ id: string; label: string }>;
  pmUsers: Array<{ id: string; fullName: string; email: string }>;
  qmUsers: Array<{ id: string; fullName: string; email: string }>;
  bmUsers: Array<{ id: string; fullName: string; email: string }>;
  onSubmit: (d: CreateForm) => void;
  isLoading: boolean;
}) {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { contractId: "", code: "", startDate: today, projectManagerId: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ contractId: "", code: "", startDate: today, projectManagerId: "" });
  }, [open, form, today]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>
            Solo desde contrato FIRMADO. Property pasará a EN_CONSTRUCCION.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Contrato firmado sin proyecto</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("contractId")}>
              <option value="">— Seleccionar —</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {form.formState.errors.contractId && <p className="mt-1 text-xs text-destructive">{form.formState.errors.contractId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Código</Label>
              <Input placeholder="PRJ-2026-001" {...form.register("code")} />
              {form.formState.errors.code && <p className="mt-1 text-xs text-destructive">{form.formState.errors.code.message}</p>}
            </div>
            <div>
              <Label>Inicio</Label>
              <Input type="date" {...form.register("startDate")} />
            </div>
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
            <Label>Encargado de calidad (opcional)</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("qualityManagerId")}>
              <option value="">— Sin asignar —</option>
              {qmUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <Label>Encargado de presupuesto (opcional)</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("budgetManagerId")}>
              <option value="">— Sin asignar —</option>
              {bmUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Crear proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
