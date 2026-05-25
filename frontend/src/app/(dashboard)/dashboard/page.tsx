"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2,
  Users,
  FileSignature,
  HardHat,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { dashboardApi } from "@/lib/dashboard-api";
import { developmentsApi } from "@/lib/api/services";
import type {
  ProjectListItem,
  PropertyListItem,
  ClientListItem,
  ContractListItem,
  ReservationListItem,
  PaymentListItem,
} from "@/lib/dashboard-api";
import type { Development, DevelopmentStatus } from "@/lib/api/types";
import { useAuthSession } from "@/providers/auth-session-provider";

const DEV_STATUS_LABEL: Record<DevelopmentStatus, string> = {
  PLANIFICACION: "Planificación",
  ADQUISICION: "Adquisición",
  PERMISOS: "Permisos",
  EN_CONSTRUCCION: "En construcción",
  COMERCIALIZACION: "Comercialización",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};
const DEV_STATUS_COLOR: Record<DevelopmentStatus, string> = {
  PLANIFICACION: "bg-slate-100 text-slate-700",
  ADQUISICION: "bg-blue-100 text-blue-700",
  PERMISOS: "bg-yellow-100 text-yellow-800",
  EN_CONSTRUCCION: "bg-amber-100 text-amber-800",
  COMERCIALIZACION: "bg-indigo-100 text-indigo-700",
  COMPLETADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};
const DEV_STATUS_PROGRESS: Record<DevelopmentStatus, number> = {
  PLANIFICACION: 10, ADQUISICION: 25, PERMISOS: 45,
  EN_CONSTRUCCION: 70, COMERCIALIZACION: 90, COMPLETADO: 100, CANCELADO: 0,
};

const PROPERTY_STATUS_COLOR: Record<string, string> = {
  DISPONIBLE: "#10b981",
  RESERVADO: "#f59e0b",
  VENDIDO: "#6366f1",
  EN_CONSTRUCCION: "#a855f7",
  ENTREGADO: "#0ea5e9",
};

const CLIENT_STATUS_ORDER = [
  "LEAD",
  "PROSPECTO",
  "RESERVADO",
  "FIRMADO",
  "ENTREGADO",
  "CERRADO",
] as const;

const STAGE_LABEL: Record<string, string> = {
  PRELIMINARES: "Preliminares",
  OBRA_BRUTA: "Obra bruta",
  OBRA_FINA: "Obra fina",
  ENTREGA: "Entrega",
};
const STAGE_PROGRESS: Record<string, number> = {
  PRELIMINARES: 15,
  OBRA_BRUTA: 45,
  OBRA_FINA: 80,
  ENTREGA: 100,
};

const formatCurrency = (n: number, currency = "BOB"): string =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

export default function DashboardPage() {
  const { session } = useAuthSession();

  const results = useQueries({
    queries: [
      { queryKey: ["dash", "properties"], queryFn: dashboardApi.properties },
      { queryKey: ["dash", "clients"], queryFn: dashboardApi.clients },
      { queryKey: ["dash", "contracts"], queryFn: dashboardApi.contracts },
      { queryKey: ["dash", "reservations"], queryFn: dashboardApi.reservations },
      { queryKey: ["dash", "projects"], queryFn: dashboardApi.projects },
      { queryKey: ["dash", "payments"], queryFn: dashboardApi.payments },
      { queryKey: ["developments"], queryFn: () => developmentsApi.list() },
    ],
  });

  const [
    propertiesQ,
    clientsQ,
    contractsQ,
    reservationsQ,
    projectsQ,
    paymentsQ,
    developmentsQ,
  ] = results;

  const properties: PropertyListItem[] = propertiesQ.data ?? [];
  const clients: ClientListItem[] = clientsQ.data ?? [];
  const contracts: ContractListItem[] = contractsQ.data ?? [];
  const reservations: ReservationListItem[] = reservationsQ.data ?? [];
  const projects: ProjectListItem[] = projectsQ.data ?? [];
  const payments: PaymentListItem[] = paymentsQ.data ?? [];
  const developments: Development[] = (developmentsQ.data ?? []) as Development[];

  const activeDevelopments = developments.filter(
    (d) => d.status !== "COMPLETADO" && d.status !== "CANCELADO",
  );
  const totalDevBudget = developments.reduce(
    (acc, d) => acc + Number(d.acquisitionBudget) + Number(d.constructionBudget),
    0,
  );

  const isLoading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.error)?.error;

  // ===== Derived KPIs =====
  const propertiesByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      DISPONIBLE: 0,
      RESERVADO: 0,
      VENDIDO: 0,
      EN_CONSTRUCCION: 0,
      ENTREGADO: 0,
    };
    properties.forEach((p) => {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      status,
      value,
      fill: PROPERTY_STATUS_COLOR[status],
    }));
  }, [properties]);

  const clientsByStatus = useMemo(() => {
    const counts: Record<string, number> = Object.fromEntries(
      CLIENT_STATUS_ORDER.map((s) => [s, 0]),
    );
    clients.forEach((c) => {
      counts[c.status] = (counts[c.status] ?? 0) + 1;
    });
    return CLIENT_STATUS_ORDER.map((s) => ({ status: s, value: counts[s] }));
  }, [clients]);

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (p) => p.status === "EN_EJECUCION" || p.status === "PLANIFICADO",
      ),
    [projects],
  );

  const signedContracts = contracts.filter((c) => c.status === "FIRMADO");
  const totalContractValue = signedContracts.reduce(
    (acc, c) => acc + Number(c.totalAmount),
    0,
  );

  const activeReservations = reservations.filter((r) => r.status === "ACTIVA");
  const availableProperties = properties.filter((p) => p.status === "DISPONIBLE");

  // Payments timeline (last 60 days, bucketed weekly)
  const paymentsSeries = useMemo(() => {
    const now = new Date();
    const buckets: Array<{ label: string; weekStart: Date; amount: number; count: number }> = [];
    for (let i = 8; i >= 0; i--) {
      const ws = new Date(now);
      ws.setDate(now.getDate() - i * 7);
      ws.setHours(0, 0, 0, 0);
      buckets.push({
        label: ws.toLocaleDateString("es-BO", { day: "2-digit", month: "short" }),
        weekStart: ws,
        amount: 0,
        count: 0,
      });
    }
    payments.forEach((p) => {
      const d = new Date(p.paymentDate);
      const idx = buckets.findIndex((b, i) => {
        const next = buckets[i + 1]?.weekStart ?? new Date(8640000000000000);
        return d >= b.weekStart && d < next;
      });
      if (idx >= 0) {
        buckets[idx].amount += Number(p.amount);
        buckets[idx].count += 1;
      }
    });
    return buckets;
  }, [payments]);

  const totalPaymentsLast60 = paymentsSeries.reduce((acc, b) => acc + b.amount, 0);

  const recentReservations = useMemo(
    () =>
      [...reservations]
        .sort(
          (a, b) =>
            new Date(b.reservationDate).getTime() -
            new Date(a.reservationDate).getTime(),
        )
        .slice(0, 5),
    [reservations],
  );

  const recentContracts = useMemo(
    () =>
      [...contracts]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [contracts],
  );

  if (error) {
    return (
      <div className="p-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Error al cargar el dashboard
          </div>
          <p className="font-mono text-xs">{String((error as Error).message)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 md:p-8">
        {/* ============ HEADER ============ */}
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              § Panel general · {new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Hola, {session?.user.fullName.split(" ")[0] ?? "usuario"}.
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Estado consolidado de ventas, obra y compras.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Backend conectado
            </span>
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <Clock className="h-3 w-3 animate-spin" />
                Cargando…
              </span>
            )}
          </div>
        </header>

        {/* ============ KPI ROW ============ */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard
            icon={Layers3}
            accent="rose"
            label="Desarrollos activos"
            value={String(activeDevelopments.length)}
            sub={`${developments.length} totales · ${formatCurrency(totalDevBudget)}`}
            href="/desarrollos"
          />
          <KpiCard
            icon={HardHat}
            accent="indigo"
            label="Proyectos activos"
            value={String(activeProjects.length)}
            sub={`${projects.length} totales`}
            href="/proyectos"
          />
          <KpiCard
            icon={Building2}
            accent="emerald"
            label="Inmuebles disponibles"
            value={String(availableProperties.length)}
            sub={`${properties.length} en cartera`}
            href="/inmuebles"
          />
          <KpiCard
            icon={Users}
            accent="amber"
            label="Clientes activos"
            value={String(
              clients.filter(
                (c) => c.status !== "CERRADO" && c.status !== "ENTREGADO",
              ).length,
            )}
            sub={`${clients.length} totales`}
            href="/clientes"
          />
          <KpiCard
            icon={FileSignature}
            accent="violet"
            label="Contratos firmados"
            value={String(signedContracts.length)}
            sub={formatCurrency(totalContractValue)}
            href="/contratos"
          />
        </div>

        {/* ============ DESARROLLOS EN CURSO ============ */}
        {activeDevelopments.length > 0 && (
          <Panel
            title="Desarrollos en curso"
            subtitle={`${activeDevelopments.length} activos`}
            tag="§ 00"
            action={
              <Link
                href="/desarrollos"
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900"
              >
                Ver todos
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeDevelopments.slice(0, 6).map((d) => {
                const pct = DEV_STATUS_PROGRESS[d.status];
                return (
                  <Link
                    key={d.id}
                    href={`/desarrollos/${d.id}`}
                    className="group rounded-lg border border-slate-200 bg-slate-50/40 p-4 transition-all hover:border-amber-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-700">{d.code}</p>
                        <h3 className="mt-0.5 truncate text-sm font-black text-slate-900">{d.name}</h3>
                        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-widest text-slate-500">{d.zone}</p>
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${DEV_STATUS_COLOR[d.status]}`}>
                        {DEV_STATUS_LABEL[d.status]}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                        <span className="text-slate-500">Avance ciclo</span>
                        <span className="font-black text-slate-900">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Panel>
        )}

        {/* ============ CHARTS ROW ============ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Properties by status */}
          <Panel
            title="Inmuebles por estado"
            subtitle="Distribución del stock"
            tag="§ 01"
            className="lg:col-span-1"
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertiesByStatus.filter((p) => p.value > 0)}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="#f8fafc"
                    strokeWidth={2}
                  >
                    {propertiesByStatus.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [v, "Inmuebles"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
              {propertiesByStatus.map((p) => (
                <li
                  key={p.status}
                  className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: p.fill }}
                    />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {p.status}
                    </span>
                  </span>
                  <span className="font-black text-slate-900">{p.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Pipeline comercial */}
          <Panel
            title="Pipeline comercial"
            subtitle="Clientes por etapa"
            tag="§ 02"
            className="lg:col-span-2"
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clientsByStatus}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 10, fill: "#64748b", fontFamily: "var(--font-geist-mono)" }}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(245,158,11,0.08)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {clientsByStatus.map((d, i) => {
                      const colors = [
                        "#cbd5e1",
                        "#94a3b8",
                        "#f59e0b",
                        "#6366f1",
                        "#0ea5e9",
                        "#475569",
                      ];
                      return <Cell key={d.status} fill={colors[i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <span>
                <span className="font-bold text-amber-700">
                  {activeReservations.length}
                </span>{" "}
                reservas activas
              </span>
              <span>
                <span className="font-bold text-indigo-600">
                  {signedContracts.length}
                </span>{" "}
                contratos firmados
              </span>
              <span>
                <span className="font-bold text-emerald-600">
                  {clients.filter((c) => c.status === "ENTREGADO").length}
                </span>{" "}
                entregas completas
              </span>
            </div>
          </Panel>
        </div>

        {/* ============ PROJECTS + PAYMENTS ============ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Active projects */}
          <Panel
            title="Proyectos activos"
            subtitle="Avance por etapa"
            tag="§ 03"
            className="lg:col-span-2"
            action={
              <Link
                href="/proyectos/torre-pirai"
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900"
              >
                Ver todos
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            {activeProjects.length === 0 ? (
              <EmptyState
                title="Sin proyectos activos"
                msg="Cuando se firme un contrato y se cree un proyecto, aparecerá aquí."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {activeProjects.slice(0, 5).map((p) => {
                  const pct = STAGE_PROGRESS[p.currentStage] ?? 0;
                  return (
                    <li
                      key={p.id}
                      className="grid grid-cols-1 gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">
                            {p.code}
                          </span>
                          <StatusBadge status={p.status} />
                        </div>
                        <h3 className="mt-1 truncate text-sm font-black tracking-tight text-slate-900">
                          {p.property?.address ?? "Proyecto sin dirección"}
                        </h3>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          {p.property?.zone ?? "—"} · inicio{" "}
                          {formatDate(p.startDate)}
                        </p>
                      </div>
                      <div className="md:w-64">
                        <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                          <span className="text-slate-500">
                            {STAGE_LABEL[p.currentStage]}
                          </span>
                          <span className="font-black text-slate-900">{pct}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Payments series */}
          <Panel
            title="Pagos · últimos 60 días"
            subtitle={formatCurrency(totalPaymentsLast60)}
            tag="§ 04"
            className="lg:col-span-1"
          >
            {totalPaymentsLast60 === 0 ? (
              <EmptyState
                title="Sin pagos recientes"
                msg="Los pagos a proveedores y contratistas aparecerán aquí."
              />
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={paymentsSeries}
                    margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="paymentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [formatCurrency(v), "Pagado"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#paymentGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        {/* ============ FEEDS ROW ============ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel
            title="Últimas reservas"
            subtitle={`${activeReservations.length} activas`}
            tag="§ 05"
          >
            {recentReservations.length === 0 ? (
              <EmptyState
                title="Sin reservas"
                msg="Las nuevas reservas aparecerán aquí."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentReservations.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-amber-600" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {formatDate(r.reservationDate)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-700">
                        Depósito{" "}
                        <span className="font-bold text-slate-900">
                          {formatCurrency(Number(r.depositAmount))}
                        </span>{" "}
                        · vence {formatDate(r.expiresAt)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Últimos contratos"
            subtitle={`${signedContracts.length} firmados`}
            tag="§ 06"
          >
            {recentContracts.length === 0 ? (
              <EmptyState
                title="Sin contratos"
                msg="Los nuevos contratos aparecerán aquí."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentContracts.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-700">
                        {c.property?.code ?? "—"} ·{" "}
                        <span className="font-bold text-slate-900">
                          {formatCurrency(Number(c.totalAmount), c.currency)}
                        </span>
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ===================== SUB-COMPONENTS =====================

function KpiCard({
  icon: Icon,
  accent,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ElementType;
  accent: "indigo" | "amber" | "emerald" | "violet" | "rose";
  label: string;
  value: string;
  sub: string;
  href?: string;
}) {
  const accentMap: Record<typeof accent, { bg: string; text: string; ring: string }> = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  };
  const a = accentMap[accent];
  const Wrapper = href ? Link : "div";
  return (
    <Wrapper
      href={href ?? "#"}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.bg} ring-4 ${a.ring}`}
        >
          <Icon className={`h-5 w-5 ${a.text}`} />
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700" />
        )}
      </div>
      <div className="mt-5">
        <div className="text-3xl font-black tracking-tight text-slate-900 tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
          {sub}
        </div>
      </div>
    </Wrapper>
  );
}

function Panel({
  title,
  subtitle,
  tag,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  tag?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <header className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          {tag && (
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-amber-700">
              {tag}
            </div>
          )}
          <h2 className="text-base font-black tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    EN_EJECUCION: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
    PLANIFICADO: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
    PAUSADO: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
    FINALIZADO: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    CANCELADO: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    ACTIVA: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
    VENCIDA: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    CONVERTIDA: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    CANCELADA: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    FIRMADO: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    BORRADOR: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
    REVISION: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
    MODIFICADO: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
    RESCINDIDO: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };
  const s = map[status] ?? { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function EmptyState({ title, msg }: { title: string; msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">{msg}</p>
    </div>
  );
}
