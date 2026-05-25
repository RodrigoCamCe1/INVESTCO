import Link from "next/link";
import {
  Building2,
  ArrowUpRight,
  Hammer,
  HardHat,
  ShieldCheck,
  ClipboardList,
  Banknote,
  Layers3,
  Users,
  ScrollText,
} from "lucide-react";

const NAV = [
  { label: "Módulos", href: "#modulos" },
  { label: "Flujo", href: "#flujo" },
  { label: "Equipo", href: "#equipo" },
];

const STATS = [
  { value: "41", label: "Casos de uso", code: "CU-101 → CU-141" },
  { value: "15", label: "Roles RBAC", code: "ADMIN ↔ OBRERO" },
  { value: "120+", label: "Endpoints REST", code: "/api/*" },
  { value: "6", label: "State machines", code: "atómicas" },
];

const MODULOS = [
  {
    code: "M-01",
    icon: Building2,
    title: "Inmuebles & Planos",
    desc: "Catálogo de propiedades con jerarquía, divisiones, modelos de plano y versionado con optimistic locking.",
  },
  {
    code: "M-02",
    icon: Users,
    title: "Comercial",
    desc: "Clientes, reuniones, credit-checks, reservas y contratos firmados con cascada atómica de estados.",
  },
  {
    code: "M-03",
    icon: HardHat,
    title: "Proyectos & Obra",
    desc: "Actividades, preliminares, dependencias FS/SS/FF/SF, asignaciones de personal y asistencia diaria.",
  },
  {
    code: "M-04",
    icon: ShieldCheck,
    title: "Calidad",
    desc: "Inspecciones por etapa, hallazgos con severidad y cierre automático según resolución del responsable.",
  },
  {
    code: "M-05",
    icon: ClipboardList,
    title: "Compras",
    desc: "Materiales, proveedores, OC con flujo de aprobación, recepciones parciales y análisis de consumo.",
  },
  {
    code: "M-06",
    icon: Banknote,
    title: "Financiero",
    desc: "Presupuesto vs ejecutado, pagos por tipo (cliente, banco, proveedor, contratista) y resumen por proyecto.",
  },
];

const FLUJO = [
  { n: "01", t: "Lead", d: "Cliente prospecto" },
  { n: "02", t: "Reserva", d: "Inmueble bloqueado" },
  { n: "03", t: "Contrato", d: "Firma + cascada" },
  { n: "04", t: "Obra", d: "Proyecto ejecutándose" },
  { n: "05", t: "Calidad", d: "Inspección final" },
  { n: "06", t: "Entrega", d: "Doble firma + cierre" },
];

const EQUIPO = [
  { rol: "Backend / Domain", nombre: "Bruno Paz Aguilera", id: "2020114321" },
  {
    rol: "Backend / Frontend",
    nombre: "Rony Javier Rivero Paniagua",
    id: "2022110749",
  },
  {
    rol: "Frontend / Arquitectura",
    nombre: "Rodrigo Camacho Cedeño",
    id: "2022212096",
  },
];

const BLUEPRINT_GRID = `
  repeating-linear-gradient(
    90deg,
    transparent,
    transparent 79px,
    rgba(148,163,184,0.08) 79px,
    rgba(148,163,184,0.08) 80px
  ),
  repeating-linear-gradient(
    0deg,
    transparent,
    transparent 79px,
    rgba(148,163,184,0.08) 79px,
    rgba(148,163,184,0.08) 80px
  )
`;

const TICK_BG = `repeating-linear-gradient(
  to right,
  rgba(245,158,11,0.6) 0 1px,
  transparent 1px 16px
)`;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      {/* ===================== BLUEPRINT BACKGROUND ===================== */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ backgroundImage: BLUEPRINT_GRID }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 80% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(ellipse at 0% 110%, rgba(120,53,15,0.35), transparent 55%)",
        }}
      />

      {/* ===================== NAV ===================== */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-900/40 transition-transform group-hover:rotate-3">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="leading-none">
              <span className="block text-sm font-black tracking-tight text-white">
                INVESTCO
              </span>
              <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
                ERP · Constructora
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400 transition-colors hover:text-amber-400"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur transition-all hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-300"
          >
            Ingresar
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        <div
          aria-hidden
          className="mx-auto h-px max-w-7xl"
          style={{ backgroundImage: TICK_BG }}
        />
      </header>

      {/* ===================== HERO ===================== */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10 lg:pt-24">
          {/* === LEFT: copy === */}
          <div className="relative">
            {/* Sheet label, blueprint style */}
            <div className="mb-10 flex items-center gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                Hoja 01 · A1
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-amber-400/40 to-transparent" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">
                SI414 / 2026
              </span>
            </div>

            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Sistema integral de control de obra
            </p>

            <h1 className="text-[clamp(2.5rem,6vw,4.75rem)] font-black leading-[0.95] tracking-tight text-white">
              Del{" "}
              <span className="relative inline-block">
                <span className="relative z-10">plano</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-amber-500/40"
                />
              </span>{" "}
              a la{" "}
              <span className="relative inline-block">
                <span className="relative z-10">entrega.</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-indigo-500/40"
                />
              </span>
              <br />
              <span className="text-slate-400">Un solo sistema.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Investco ERP cubre el ciclo completo de una constructora boliviana:
              venta de inmuebles, reserva, contrato, ejecución de obra, calidad,
              compras y entrega &mdash; con state machines auditables y RBAC para
              15 roles operativos.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md bg-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-amber-900/30 transition-all hover:shadow-amber-700/40"
              >
                <span className="relative z-10">Ingresar al sistema</span>
                <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 transition-transform duration-500 group-hover:translate-x-0"
                />
              </Link>
              <a
                href="#modulos"
                className="inline-flex items-center gap-2 rounded-md border border-slate-700/80 bg-slate-900/40 px-5 py-3.5 text-sm font-bold text-slate-200 backdrop-blur transition-colors hover:border-slate-500 hover:bg-slate-900/70"
              >
                Ver módulos
                <span className="font-mono text-[10px] text-slate-500">↓</span>
              </a>
            </div>

            {/* Dimension line */}
            <div className="mt-14 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <span className="text-amber-400">├</span>
              <span className="h-px w-12 bg-slate-700" />
              <span>Bolivia · UTEPSA · 2026</span>
              <span className="h-px flex-1 bg-slate-800" />
              <span>v0.1.0</span>
              <span className="text-amber-400">┤</span>
            </div>
          </div>

          {/* === RIGHT: blueprint composition === */}
          <div className="relative h-[460px] sm:h-[520px] lg:h-auto">
            {/* Frame */}
            <div className="absolute inset-0 rounded-md border border-slate-800 bg-slate-950/40 backdrop-blur-sm">
              {/* Inner grid */}
              <div
                aria-hidden
                className="absolute inset-3 rounded-sm border border-slate-800/80"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(148,163,184,0.08) 39px, rgba(148,163,184,0.08) 40px),
                    repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(148,163,184,0.08) 39px, rgba(148,163,184,0.08) 40px)
                  `,
                }}
              />

              {/* Corner labels */}
              <span className="absolute left-4 top-3 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                INV / ARQ-01
              </span>
              <span className="absolute right-4 top-3 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
                Esc 1:100
              </span>
              <span className="absolute bottom-3 left-4 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                Rev. C
              </span>
              <span className="absolute bottom-3 right-4 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                25 · 05 · 2026
              </span>

              {/* Floating boxes (blueprints) */}
              <div className="absolute left-[8%] top-[14%] h-32 w-44 rotate-[-4deg] rounded-sm border border-amber-500/40 bg-amber-500/[0.06] p-3 shadow-xl shadow-amber-900/20">
                <div className="font-mono text-[9px] uppercase tracking-widest text-amber-400">
                  Torre Piraí · A
                </div>
                <div className="mt-1 text-xs font-black text-slate-100">
                  4 plantas · 12 deptos
                </div>
                <div className="mt-3 h-1 w-full bg-slate-800">
                  <div className="h-1 w-3/4 bg-amber-500" />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[8px] text-slate-500">
                  <span>OBRA_BRUTA</span>
                  <span>75%</span>
                </div>
              </div>

              <div className="absolute right-[6%] top-[8%] h-36 w-48 rotate-[3deg] rounded-sm border border-indigo-500/40 bg-indigo-500/[0.08] p-3 shadow-xl shadow-indigo-900/30">
                <div className="font-mono text-[9px] uppercase tracking-widest text-indigo-300">
                  Contrato · #C-0042
                </div>
                <div className="mt-1 text-xs font-black text-slate-100">
                  $ 184.500 USD
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                  ● FIRMADO
                </div>
                <div className="mt-2 font-mono text-[9px] text-slate-500">
                  Reservation → Contract → Project
                </div>
              </div>

              <div className="absolute left-[14%] bottom-[20%] h-28 w-56 rotate-[1deg] rounded-sm border border-slate-700 bg-slate-900/70 p-3 backdrop-blur shadow-xl shadow-black/40">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Inspección QC-018
                </div>
                <div className="mt-1 text-xs font-black text-slate-100">
                  0 hallazgos críticos
                </div>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-4 ${
                        i <= 5 ? "bg-emerald-400" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-1 font-mono text-[8px] text-slate-500">
                  RESUELTA · cerrada
                </div>
              </div>

              <div className="absolute right-[10%] bottom-[14%] h-24 w-40 -rotate-[2deg] rounded-sm border border-slate-700 bg-slate-900/70 p-3 backdrop-blur shadow-xl shadow-black/40">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  OC · #PO-0117
                </div>
                <div className="mt-1 text-xs font-black text-slate-100">
                  Cemento · 240 sc
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-sm border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-amber-300">
                  ● APROBADA
                </div>
              </div>

              {/* Dimension lines */}
              <div className="absolute left-1/2 top-1/2 h-px w-40 -translate-x-1/2 -translate-y-1/2 bg-amber-500/50">
                <span className="absolute -top-1 left-0 h-2 w-px bg-amber-500/50" />
                <span className="absolute -top-1 right-0 h-2 w-px bg-amber-500/50" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-400">
                  6 módulos · 1 sistema
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-y border-slate-800/80 bg-slate-950/60 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-800/80 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`group relative px-6 py-7 transition-colors hover:bg-slate-900/60 lg:px-10 ${
                  i >= 2 ? "border-t border-slate-800/80 lg:border-t-0" : ""
                }`}
              >
                <span className="absolute left-6 top-3 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600 lg:left-10">
                  {String(i + 1).padStart(2, "0")} /
                </span>
                <div className="mt-3 text-4xl font-black tracking-tight text-white">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-300">
                  {s.label}
                </div>
                <div className="mt-1 font-mono text-[10px] text-amber-400/80">
                  {s.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== MÓDULOS ===================== */}
      <section id="modulos" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 flex items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                § 02 · Módulos
              </div>
              <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Seis módulos.{" "}
                <span className="text-slate-500">Cero hojas de cálculo.</span>
              </h2>
            </div>
            <div className="hidden font-mono text-[10px] uppercase tracking-widest text-slate-500 md:block">
              06 · cobertura total
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md bg-slate-800/80 md:grid-cols-2 lg:grid-cols-3">
            {MODULOS.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.code}
                  className="group relative bg-slate-950 p-7 transition-colors hover:bg-slate-900/80"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-amber-400 transition-all group-hover:border-amber-500/50 group-hover:bg-amber-500/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-colors group-hover:text-amber-400">
                      {m.code}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-black tracking-tight text-white">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {m.desc}
                  </p>
                  <ArrowUpRight className="absolute right-7 top-7 h-4 w-4 -translate-y-1 translate-x-1 text-slate-700 opacity-0 transition-all group-hover:-translate-y-0 group-hover:translate-x-0 group-hover:text-amber-400 group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FLUJO ===================== */}
      <section
        id="flujo"
        className="relative border-y border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/40 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 flex items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                § 03 · Flujo de negocio
              </div>
              <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Un pipeline.{" "}
                <span className="text-slate-500">Seis estados atómicos.</span>
              </h2>
            </div>
            <div className="hidden font-mono text-[10px] uppercase tracking-widest text-slate-500 md:block">
              State machines
            </div>
          </div>

          <ol className="relative">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-px md:block"
              style={{ backgroundImage: TICK_BG }}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {FLUJO.map((step) => (
                <li
                  key={step.n}
                  className="relative rounded-sm border border-slate-800/80 bg-slate-950/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900/80"
                >
                  <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-slate-700 bg-slate-900 font-mono text-sm font-black text-amber-400">
                    {step.n}
                  </div>
                  <div className="text-base font-black tracking-tight text-white">
                    {step.t}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {step.d}
                  </div>
                </li>
              ))}
            </div>
          </ol>

          <div className="mt-12 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <span className="text-amber-400">●</span>
            <span>
              Property: DISPONIBLE → RESERVADO → VENDIDO → EN_CONSTRUCCION →
              ENTREGADO
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <span className="text-indigo-400">●</span>
            <span>
              Contract: BORRADOR → REVISION → FIRMADO → MODIFICADO / RESCINDIDO
            </span>
          </div>
        </div>
      </section>

      {/* ===================== STACK ===================== */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                § 04 · Stack
              </div>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Construido sobre <br />
                <span className="text-slate-500">tipos estrictos.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
                Sin atajos. Validación estricta en cada DTO, optimistic locking
                en contratos y planos, transacciones atómicas en cascadas de
                estado y mocks deterministas para presentación.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px rounded-md bg-slate-800/80 sm:grid-cols-3">
              {[
                { k: "Runtime", v: "Node 24" },
                { k: "Framework", v: "NestJS 11" },
                { k: "ORM", v: "Prisma 6" },
                { k: "DB", v: "Postgres 16" },
                { k: "Frontend", v: "Next 15" },
                { k: "UI", v: "React 19 · TW v4" },
                { k: "Auth", v: "JWT · bcrypt" },
                { k: "Data", v: "TanStack Query" },
                { k: "State", v: "Zustand" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="bg-slate-950 p-5 transition-colors hover:bg-slate-900/80"
                >
                  <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {s.k}
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-100">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== EQUIPO ===================== */}
      <section
        id="equipo"
        className="relative border-y border-slate-800/80 bg-slate-950/60 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 flex items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                § 05 · Equipo
              </div>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Proyecto académico.{" "}
                <span className="text-slate-500">Estándares de producción.</span>
              </h2>
            </div>
            <div className="hidden text-right font-mono text-[10px] uppercase tracking-widest text-slate-500 md:block">
              SI414 · UTEPSA <br />
              Grupo A · 2026
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px rounded-md bg-slate-800/80 md:grid-cols-3">
            {EQUIPO.map((p, i) => (
              <div
                key={p.id}
                className="group relative bg-slate-950 p-7 transition-colors hover:bg-slate-900/80"
              >
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-400/80">
                  {String(i + 1).padStart(2, "0")} /
                </span>
                <div className="mt-3 text-xl font-black tracking-tight text-white">
                  {p.nombre}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  {p.rol}
                </div>
                <div className="mt-6 inline-flex items-center gap-2 border-t border-slate-800 pt-4 font-mono text-[10px] text-slate-500">
                  <span className="text-amber-400">REG</span>
                  <span>{p.id}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-md border border-slate-800/80 bg-slate-950 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-amber-400">
                <ScrollText className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Docente
                </div>
                <div className="text-sm font-black text-white">
                  Ing. Nancy Velasquez Suarez
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-indigo-300">
                <Layers3 className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Metodología
                </div>
                <div className="text-sm font-black text-white">
                  Larman · UML · GRASP
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-emerald-300">
                <Hammer className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Modo
                </div>
                <div className="text-sm font-black text-white">
                  Demo · mocks deterministas
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="relative py-28">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
            § 06 · Acceso
          </div>
          <h2 className="mt-4 text-[clamp(2.25rem,5vw,4rem)] font-black leading-[1.05] tracking-tight text-white">
            Listo para entrar al sistema.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400">
            Las credenciales de prueba están sembradas en la base. Si sos del
            equipo del proyecto, ya tenés acceso.
          </p>
          <div className="mt-10 inline-flex items-center gap-4 rounded-md border border-slate-800 bg-slate-950/80 p-2 backdrop-blur">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md bg-amber-500 px-7 py-4 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-amber-900/30 transition-all"
            >
              <span className="relative z-10">Ingresar al ERP</span>
              <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 transition-transform duration-500 group-hover:translate-x-0"
              />
            </Link>
            <div className="hidden font-mono text-[10px] uppercase tracking-widest text-slate-500 sm:block">
              · localhost:3001/login
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="relative border-t border-slate-800/80 bg-slate-950">
        <div
          aria-hidden
          className="mx-auto h-px max-w-7xl"
          style={{ backgroundImage: TICK_BG }}
        />
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="leading-none">
              <div className="text-xs font-black text-white">INVESTCO</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                ERP · Control de obra · 2026
              </div>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            SI414 · UTEPSA · Bolivia
          </div>
          <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <a
              href="https://github.com/RodrigoCamCe1/INVESTCO"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-amber-400"
            >
              Repositorio
            </a>
            <span>·</span>
            <span>Licencia académica</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
