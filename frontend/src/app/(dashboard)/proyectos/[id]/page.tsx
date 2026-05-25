"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, HardHat, Loader2, Calendar, MapPin, FileSignature, User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { projectsApi, propertiesApi, contractsApi, clientsApi, usersApi } from "@/lib/api/services";
import type { ProjectStage, ProjectStatus } from "@/lib/api/types";

const stageProgress: Record<ProjectStage, number> = {
  PRELIMINARES: 15, OBRA_BRUTA: 45, OBRA_FINA: 80, ENTREGA: 100,
};
const stageLabel: Record<ProjectStage, string> = {
  PRELIMINARES: "Preliminares", OBRA_BRUTA: "Obra bruta", OBRA_FINA: "Obra fina", ENTREGA: "Entrega",
};
const statusColor: Record<ProjectStatus, string> = {
  PLANIFICADO: "bg-slate-100 text-slate-700",
  EN_EJECUCION: "bg-amber-100 text-amber-700",
  PAUSADO: "bg-orange-100 text-orange-700",
  FINALIZADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" });
const fmtMoney = (n: number, c = "BOB") =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export default function ProyectoDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const projectQ = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id && id.length === 36,
  });

  const project = projectQ.data;

  const propertyQ = useQuery({
    queryKey: ["property", project?.propertyId],
    queryFn: () => propertiesApi.get(project!.propertyId),
    enabled: !!project,
  });
  const contractQ = useQuery({
    queryKey: ["contract", project?.contractId],
    queryFn: () => contractsApi.get(project!.contractId),
    enabled: !!project,
  });
  const clientQ = useQuery({
    queryKey: ["client", contractQ.data?.clientId],
    queryFn: () => clientsApi.get(contractQ.data!.clientId),
    enabled: !!contractQ.data,
  });
  const pmQ = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => usersApi.list(),
    enabled: !!project,
  });

  if (id.length !== 36) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-3xl space-y-5 p-6 md:p-8">
          <Link href="/proyectos" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3 w-3" /> Proyectos
          </Link>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            El ID en la URL no es un UUID válido. Andá a <Link href="/proyectos" className="font-bold underline">/proyectos</Link> y elegí uno desde la lista.
          </div>
        </div>
      </div>
    );
  }

  if (projectQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando proyecto…
      </div>
    );
  }

  if (projectQ.error || !project) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-3xl space-y-5 p-6 md:p-8">
          <Link href="/proyectos" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3 w-3" /> Proyectos
          </Link>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Proyecto no encontrado.</div>
        </div>
      </div>
    );
  }

  const property = propertyQ.data;
  const contract = contractQ.data;
  const client = clientQ.data;
  const pm = (pmQ.data ?? []).find((u) => u.id === project.projectManagerId);
  const qm = (pmQ.data ?? []).find((u) => u.id === project.qualityManagerId);
  const bm = (pmQ.data ?? []).find((u) => u.id === project.budgetManagerId);
  const pct = stageProgress[project.currentStage];

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1200px] space-y-5 p-6 md:p-8">
        <Link href="/proyectos" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3 w-3" /> Proyectos
        </Link>

        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">{project.code}</p>
              <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
                <HardHat className="h-7 w-7 text-amber-600" />
                {property?.address ?? "Proyecto"}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {property?.zone ?? "—"} · {property?.code ?? "—"} · {property?.type ?? "—"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`font-mono text-[10px] font-bold uppercase tracking-widest ${statusColor[project.status]}`}>{project.status}</Badge>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                {stageLabel[project.currentStage]} · {pct}%
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(["PRELIMINARES", "OBRA_BRUTA", "OBRA_FINA", "ENTREGA"] as ProjectStage[]).map((s) => (
                <div
                  key={s}
                  className={`rounded-md border px-3 py-2 text-center font-mono text-[9px] font-bold uppercase tracking-widest ${
                    project.currentStage === s
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : stageProgress[s] < pct
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {stageLabel[s]}
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="border-b border-slate-100 pb-2 text-sm font-black tracking-tight text-slate-900">Contrato y cliente</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <Row icon={FileSignature} label="Contrato">
                <span className="font-mono text-xs text-slate-700">{contract?.id.slice(0, 8)}…</span>
                <Badge className="ml-2 font-mono text-[9px] font-bold uppercase">{contract?.status ?? "—"}</Badge>
              </Row>
              <Row icon={User} label="Cliente">
                {client ? `${client.firstName} ${client.lastName}` : "—"}
                {client?.ci && <span className="ml-2 font-mono text-xs text-slate-500">CI {client.ci}</span>}
              </Row>
              <Row icon={Calendar} label="Monto contrato">
                {contract ? fmtMoney(Number(contract.totalAmount), contract.currency) : "—"}
              </Row>
              <Row icon={Calendar} label="Entrega comprometida">
                {contract ? fmtDate(contract.deliveryDeadline) : "—"}
              </Row>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="border-b border-slate-100 pb-2 text-sm font-black tracking-tight text-slate-900">Equipo y fechas</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <Row icon={User} label="Encarg. proyecto">{pm?.fullName ?? "—"}</Row>
              <Row icon={User} label="Encarg. calidad">{qm?.fullName ?? "—"}</Row>
              <Row icon={User} label="Encarg. presupuesto">{bm?.fullName ?? "—"}</Row>
              <Row icon={Calendar} label="Inicio">{fmtDate(project.startDate)}</Row>
              <Row icon={Calendar} label="Fin previsto">{project.endDate ? fmtDate(project.endDate) : "—"}</Row>
            </dl>
          </section>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">§ Pendiente UI</p>
          <p className="mt-1 max-w-xl mx-auto">
            Activities, staff, calidad, compras y entrega están disponibles vía API
            (<code className="font-mono text-xs">/api/projects/{project.id.slice(0, 8)}…</code>).
            Próximas iteraciones agregarán tabs por sección.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div className="flex-1">
        <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
        <div className="mt-0.5 text-sm text-slate-900">{children}</div>
      </div>
    </div>
  );
}
