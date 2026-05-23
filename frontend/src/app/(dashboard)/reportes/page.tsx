"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3, TrendingUp, ShieldAlert, Calendar, AlertTriangle,
  ChevronRight, Lock, Activity, DollarSign,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MoneyDisplay } from "@/components/ui/money-display"
import { BannerDemo } from "@/components/banner-demo"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"

// ── RBAC: solo ADMIN y ENCARG_PROYECTO tienen REPORTS_READ ──────
// ── Mock data ──────────────────────────────────────────────────
const PROYECTOS_MOCK = [
  { id: "PRJ-PIRAI", nombre: "Torre Piraí", progressBruta: 65, delayDays: 8, plannedAmount: "4850000.00", actualAmount: "1285000.00", hallazgosCriticos: 1 },
  { id: "PRJ-PAURO", nombre: "Residencial El Pauro", progressBruta: 30, delayDays: 0, plannedAmount: "2100000.00", actualAmount: "420000.00", hallazgosCriticos: 0 },
  { id: "PRJ-LOMAS", nombre: "Lomas del Este - Dúplex A", progressBruta: 92, delayDays: 3, plannedAmount: "1750000.00", actualAmount: "1640000.00", hallazgosCriticos: 2 },
]

const REPORT_CARDS = [
  { tipo: "calidad", label: "Control de Calidad", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", desc: "Hallazgos por severidad e incidencias vencidas" },
  { tipo: "avance", label: "Avance de Obra", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", desc: "Curva S planificado vs. real" },
  { tipo: "materiales", label: "Materiales", icon: Activity, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Eficiencia de uso de materiales" },
  { tipo: "mano-obra", label: "Mano de Obra", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", desc: "Costo acumulado de asistencias" },
  { tipo: "cronograma", label: "Cronograma", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Gantt por fecha de inicio planificada" },
  { tipo: "presupuesto", label: "Presupuesto", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Distribución de costos y salud financiera" },
]

// ── Fórmula de avance global ─────────────────────────────────
function calcAvanceGlobal(progressBruta: number): number {
  return Math.round(15 + progressBruta * 0.45)
}

function ProgressRing({ pct, size = 80, stroke = 7 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  const cx = size / 2
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute rotate-[-90deg]" width={size} height={size}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#4f46e5" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <div className="text-center z-10">
        <span className="text-base font-extrabold text-slate-900">{pct}%</span>
      </div>
    </div>
  )
}

type SemaforoColor = "verde" | "amarillo" | "rojo"
function Semaforo({ color, label }: { color: SemaforoColor; label: string }) {
  const s = { verde: "bg-emerald-50 border-emerald-200 text-emerald-700 bg-emerald-500", amarillo: "bg-amber-50 border-amber-200 text-amber-700 bg-amber-500", rojo: "bg-red-50 border-red-200 text-red-700 bg-red-500" }[color]
  const parts = s.split(" ")
  return (
    <div className={`${parts[0]} ${parts[1]} border rounded-xl px-3 py-1.5 flex items-center gap-2`}>
      <div className={`h-2.5 w-2.5 rounded-full ${parts[4]} ${color !== "verde" ? "animate-pulse" : ""}`} />
      <span className={`text-xs font-bold ${parts[2]}`}>{label}</span>
    </div>
  )
}

export default function ReportesPage() {
  const { session } = useAuthSession()
  const canRead = session?.permissions.includes(PERMISSIONS.REPORTS_READ) ?? false
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

  // RBAC guard
  if (!canRead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-10 max-w-md text-center">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Acceso Denegado</h2>
          <p className="text-sm text-slate-500 mb-4">
            El módulo de Reportes está restringido a roles con permiso <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">reports:read</code>.
          </p>
          <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
            Rol actual: {session?.user.roles[0] ?? "Sin sesión"}
          </Badge>
        </div>
      </div>
    )
  }

  // KPI calculations (reactive over mock data)
  const avancePromedio = Math.round(PROYECTOS_MOCK.reduce((acc, p) => acc + calcAvanceGlobal(p.progressBruta), 0) / PROYECTOS_MOCK.length)
  const totalCriticos = PROYECTOS_MOCK.reduce((acc, p) => acc + p.hallazgosCriticos, 0)
  const delayPromedio = Math.round(PROYECTOS_MOCK.reduce((acc, p) => acc + p.delayDays, 0) / PROYECTOS_MOCK.length)

  // Desviación presupuestaria total (strings)
  const totalPlanned = PROYECTOS_MOCK.reduce((acc, p) => acc + parseFloat(p.plannedAmount), 0)
  const totalActual = PROYECTOS_MOCK.reduce((acc, p) => acc + parseFloat(p.actualAmount), 0)
  const desvPct = totalPlanned > 0 ? (((totalActual - totalPlanned) / totalPlanned) * 100).toFixed(1) : "0.0"
  const desvColor: SemaforoColor = parseFloat(desvPct) < 2 ? "verde" : parseFloat(desvPct) < 8 ? "amarillo" : "rojo"

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Dashboard Gerencial — Analítica Ejecutiva
          </h1>
          <p className="text-sm text-slate-500 mt-1">Resumen de indicadores clave para los {PROYECTOS_MOCK.length} proyectos activos (CU#24-#29).</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Avance Físico Global */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <ProgressRing pct={avancePromedio} />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Avance Físico Global</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Promedio ponderado</p>
              <p className="text-[10px] text-slate-400">Fórmula: 15 + (Bruta × 0.45)</p>
            </div>
          </div>

          {/* Desviación Presupuestaria */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />Desviación Presupuestaria
            </p>
            <p className="text-2xl font-extrabold text-slate-800">
              {parseFloat(desvPct) >= 0 ? "+" : ""}{desvPct}%
            </p>
            <div className="mt-2">
              <Semaforo color={desvColor} label={parseFloat(desvPct) >= 0 ? "Sobrecosto" : "Ahorros"} />
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Planificado: <MoneyDisplay amount={totalPlanned.toFixed(2)} className="font-bold text-slate-600" />
            </div>
          </div>

          {/* Salud de Calidad */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />Salud de Calidad
            </p>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-black ${totalCriticos > 0 ? "text-red-600" : "text-emerald-600"}`}>{totalCriticos}</span>
              <span className="text-sm text-slate-500 pb-1">hallazgos críticos</span>
            </div>
            <div className="mt-2">
              <Semaforo color={totalCriticos === 0 ? "verde" : totalCriticos <= 2 ? "amarillo" : "rojo"}
                label={totalCriticos === 0 ? "Sin alertas críticas" : "Requiere atención inmediata"} />
            </div>
          </div>

          {/* Adherencia al Cronograma */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />Adherencia al Cronograma
            </p>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-black ${delayPromedio === 0 ? "text-emerald-600" : delayPromedio <= 5 ? "text-amber-600" : "text-red-600"}`}>{delayPromedio}</span>
              <span className="text-sm text-slate-500 pb-1">días de retraso prom.</span>
            </div>
            <div className="mt-2">
              <Semaforo color={delayPromedio === 0 ? "verde" : delayPromedio <= 7 ? "amarillo" : "rojo"}
                label={delayPromedio === 0 ? "En tiempo" : `${delayPromedio}d de retraso`} />
            </div>
          </div>
        </div>

        {/* Proyectos overview table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-800">Resumen por Proyecto</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 bg-slate-50/30">
                <tr>
                  <th className="px-5 py-3">Proyecto</th>
                  <th className="px-5 py-3">Avance Global</th>
                  <th className="px-5 py-3">Presupuesto</th>
                  <th className="px-5 py-3">Retraso</th>
                  <th className="px-5 py-3">Calidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PROYECTOS_MOCK.map(p => {
                  const av = calcAvanceGlobal(p.progressBruta)
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {p.nombre}
                        <span className="block font-mono text-[10px] text-slate-400">{p.id}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full max-w-[80px] overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${av}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{av}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <MoneyDisplay amount={p.actualAmount} className="font-bold text-indigo-700" />
                        <span className="block text-slate-400">de <MoneyDisplay amount={p.plannedAmount} /></span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${p.delayDays === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : p.delayDays <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                          {p.delayDays === 0 ? "En tiempo" : `+${p.delayDays}d`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {p.hallazgosCriticos > 0 ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-700">
                            <AlertTriangle className="h-3.5 w-3.5" />{p.hallazgosCriticos} crítico(s)
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">✓ OK</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Módulos de Reporte Detallado</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_CARDS.map(r => (
              <Link key={r.tipo} href={`/reportes/${r.tipo}`}
                className={`bg-white border ${r.border} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex items-start gap-4`}>
                <div className={`${r.bg} ${r.border} border rounded-xl p-2.5 shrink-0`}>
                  <r.icon className={`h-5 w-5 ${r.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{r.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors mt-0.5 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
