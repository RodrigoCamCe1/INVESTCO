"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { BarChart3, FileDown, Loader2, RefreshCw, AlertTriangle, ChevronLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BannerDemo } from "@/components/banner-demo"
import { MoneyDisplay } from "@/components/ui/money-display"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts"

// ── Tipos de reporte ─────────────────────────────────────────────
const REPORT_META: Record<string, { label: string; desc: string }> = {
  calidad: { label: "Control de Calidad", desc: "Hallazgos por severidad e incidencias vencidas (CU#24)" },
  avance: { label: "Avance de Obra", desc: "Curva S — Planificado vs. Real (CU#25)" },
  materiales: { label: "Materiales según Avance", desc: "Eficiencia de uso de materiales (CU#26)" },
  "mano-obra": { label: "Mano de Obra", desc: "Costos acumulados de asistencias (CU#27)" },
  cronograma: { label: "Cronograma", desc: "Gantt por fecha de inicio planificada (CU#28)" },
  presupuesto: { label: "Presupuesto", desc: "Distribución de costos y salud financiera (CU#29)" },
}

// ── Mock data por tipo ────────────────────────────────────────────
const MOCK_DATA = {
  calidad: {
    barras: [
      { severidad: "LEVE", cantidad: 8 },
      { severidad: "MEDIA", cantidad: 5 },
      { severidad: "GRAVE", cantidad: 3 },
      { severidad: "CRITICA", cantidad: 2 },
    ],
    vencidas: [
      { id: "HQ-001", desc: "Fisuras en viga eje C-D", severidad: "CRITICA", dias: 12 },
      { id: "HQ-003", desc: "Calidad de mezcla subestándar", severidad: "GRAVE", dias: 5 },
    ],
  },
  avance: {
    curvaS: [
      { mes: "Feb", planificado: 8, real: 7 },
      { mes: "Mar", planificado: 22, real: 19 },
      { mes: "Abr", planificado: 40, real: 35 },
      { mes: "May", planificado: 58, real: 50 },
      { mes: "Jun", planificado: 72, real: null },
      { mes: "Jul", planificado: 85, real: null },
      { mes: "Ago", planificado: 95, real: null },
    ],
  },
  materiales: {
    items: [
      { material: "Cemento", expectedUsage: 500, actualUsage: 610, unit: "bolsas" },
      { material: "Acero 12mm", expectedUsage: 1000, actualUsage: 980, unit: "varillas" },
      { material: "Arena", expectedUsage: 120, actualUsage: 145, unit: "m³" },
      { material: "Ladrillos", expectedUsage: 8000, actualUsage: 7950, unit: "pzas" },
    ],
  },
  "mano-obra": {
    registros: [
      { trabajador: "Ing. Roberto Méndez", horas: 320, tarifa: "185.00", categoria: "Planta" },
      { trabajador: "Tec. José Flores", horas: 280, tarifa: "120.00", categoria: "Planta" },
      { trabajador: "Arq. Sofía Alarcón", horas: 200, tarifa: "160.00", categoria: "Planta" },
      { trabajador: "Constructora Arco SRL", horas: 640, tarifa: "95.00", categoria: "Contratista" },
    ],
  },
  cronograma: {
    tareas: [
      { nombre: "Excavación y Cimientos", inicio: "01/02/2026", fin: "28/02/2026", progreso: 100, estado: "TERMINADA" },
      { nombre: "Estructura de Hormigón", inicio: "01/03/2026", fin: "15/05/2026", progreso: 50, estado: "EN_CURSO" },
      { nombre: "Techado y Cubierta", inicio: "16/05/2026", fin: "15/06/2026", progreso: 0, estado: "PENDIENTE" },
      { nombre: "Instalaciones Hidrosanitarias", inicio: "16/06/2026", fin: "15/08/2026", progreso: 0, estado: "PENDIENTE" },
      { nombre: "Acabados y Pintura", inicio: "16/08/2026", fin: "30/09/2026", progreso: 0, estado: "PENDIENTE" },
    ],
  },
  presupuesto: {
    torta: [
      { name: "Materiales", value: 2200000, color: "#4f46e5" },
      { name: "Mano de Obra", value: 1450000, color: "#f59e0b" },
      { name: "Equipos", value: 850000, color: "#10b981" },
      { name: "Otros", value: 350000, color: "#94a3b8" },
    ],
    plannedTotal: "4850000.00",
    actualTotal: "4270000.00",
  },
}

const BAR_COLORS: Record<string, string> = {
  LEVE: "#94a3b8", MEDIA: "#f59e0b", GRAVE: "#f97316", CRITICA: "#ef4444"
}

export default function ReporteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuthSession()
  const canRead = session?.permissions.includes(PERMISSIONS.REPORTS_READ) ?? false
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

  const tipo = (params?.tipo as string) ?? ""
  const meta = REPORT_META[tipo]

  const [proyecto, setProyecto] = React.useState("PRJ-PIRAI")
  const [etapa, setEtapa] = React.useState("TODAS")
  const [estado, setEstado] = React.useState<"idle" | "loading" | "ready">("idle")
  const [jobId, setJobId] = React.useState("")

  // RBAC guard
  if (!canRead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-2xl p-10 max-w-md text-center">
          <Lock className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Acceso Denegado</h2>
          <p className="text-sm text-slate-500">No tienes permiso <code className="bg-slate-100 px-1 rounded">reports:read</code> para ver reportes.</p>
        </div>
      </div>
    )
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-500 text-sm">Tipo de reporte no reconocido: <code>{tipo}</code></p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/reportes")}>Volver al Dashboard</Button>
        </div>
      </div>
    )
  }

  const handleGenerar = () => {
    const fakeJobId = `job-${Date.now().toString(36).toUpperCase()}`
    setJobId(fakeJobId)
    setEstado("loading")
    toast.info(`Reporte encolado (BullMQ)`, { description: `Job ID: ${fakeJobId}` })
    setTimeout(() => {
      setEstado("ready")
      toast.success("report.ready — Reporte disponible", { description: `Job ${fakeJobId} finalizado.` })
    }, 3000)
  }

  const handleExport = (format: "PDF" | "Excel") => {
    toast.success(`Exportando como ${format}...`, { description: `Reporte ${meta.label} - ${proyecto}` })
  }

  const data = MOCK_DATA[tipo as keyof typeof MOCK_DATA] as any

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/reportes")} className="text-slate-500">
            <ChevronLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" /> Reporte: {meta.label}
            </h1>
            <p className="text-xs text-slate-500">{meta.desc}</p>
          </div>
        </div>

        {/* Filters + Generate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Configuración del Reporte</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Proyecto</label>
              <select value={proyecto} onChange={e => setProyecto(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                <option value="PRJ-PIRAI">Torre Piraí</option>
                <option value="PRJ-PAURO">Residencial El Pauro</option>
                <option value="PRJ-LOMAS">Lomas del Este</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Etapa</label>
              <select value={etapa} onChange={e => setEtapa(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                <option value="TODAS">Todas</option>
                <option value="OBRA_BRUTA">Obra Bruta</option>
                <option value="OBRA_FINA">Obra Fina</option>
              </select>
            </div>
            <Button onClick={handleGenerar} disabled={estado === "loading"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {estado === "loading" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {estado === "loading" ? "Procesando..." : "Generar Reporte"}
            </Button>
            {estado === "ready" && (
              <>
                <Button variant="outline" onClick={() => handleExport("PDF")}>
                  <FileDown className="h-4 w-4 mr-1.5" /> PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport("Excel")}>
                  <FileDown className="h-4 w-4 mr-1.5" /> Excel
                </Button>
              </>
            )}
          </div>
          {estado === "loading" && (
            <div className="mt-4 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Procesando Reporte... &nbsp;<code className="font-mono">Job: {jobId}</code>
            </div>
          )}
        </div>

        {/* Report Content */}
        {estado === "ready" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">{meta.label} — {proyecto}</h2>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">report.ready ✓</Badge>
            </div>

            {/* CALIDAD */}
            {tipo === "calidad" && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Hallazgos por Severidad</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.barras}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="severidad" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                        {data.barras.map((entry: any) => (
                          <Cell key={entry.severidad} fill={BAR_COLORS[entry.severidad]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Incidencias Vencidas</p>
                  <div className="space-y-2">
                    {data.vencidas.map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                        <div>
                          <span className="font-mono text-[10px] text-red-600 font-bold mr-2">{v.id}</span>
                          <span className="text-sm text-slate-800">{v.desc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px]">{v.severidad}</Badge>
                          <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />{v.dias}d vencida
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AVANCE - Curva S */}
            {tipo === "avance" && (
              <div>
                {isUseMocks && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl mb-4">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Modo Demo: Los datos de la Curva S son simulados. Conecte al backend para datos reales.
                  </div>
                )}
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Curva S — Planificado vs. Real (%)</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.curvaS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `${v}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="planificado" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Planificado" />
                    <Line type="monotone" dataKey="real" stroke="#4f46e5" strokeWidth={2.5} name="Real" connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* MATERIALES */}
            {tipo === "materiales" && (
              <div className="space-y-4">
                {data.items.map((item: any) => {
                  const eficiencia = item.expectedUsage / item.actualUsage
                  const isBad = eficiencia < 0.85
                  return (
                    <div key={item.material} className={`flex items-center justify-between p-4 rounded-xl border ${isBad ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                      <div>
                        <p className="font-semibold text-slate-800">{item.material}</p>
                        <p className="text-[10px] text-slate-500">Esperado: {item.expectedUsage} {item.unit} | Usado: {item.actualUsage} {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-extrabold ${isBad ? "text-red-600" : "text-emerald-600"}`}>{(eficiencia * 100).toFixed(0)}%</p>
                        {isBad && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px] flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-2.5 w-2.5" /> Eficiencia baja
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* MANO DE OBRA */}
            {tipo === "mano-obra" && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Costo Acumulado por Trabajador</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-[10px] uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left">Trabajador</th>
                        <th className="px-4 py-3 text-right">Horas</th>
                        <th className="px-4 py-3 text-right">Tarifa/h</th>
                        <th className="px-4 py-3 text-right font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.registros.map((r: any) => {
                        const total = (r.horas * parseFloat(r.tarifa)).toFixed(2)
                        return (
                          <tr key={r.trabajador} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {r.trabajador}
                              <Badge variant="secondary" className="ml-2 text-[9px]">{r.categoria}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-600">{r.horas}h</td>
                            <td className="px-4 py-3 text-right text-slate-600"><MoneyDisplay amount={r.tarifa} /></td>
                            <td className="px-4 py-3 text-right font-bold text-indigo-700"><MoneyDisplay amount={total} /></td>
                          </tr>
                        )
                      })}
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                        <td className="px-4 py-3 text-slate-800" colSpan={3}>TOTAL MANO DE OBRA</td>
                        <td className="px-4 py-3 text-right text-indigo-800 text-base">
                          <MoneyDisplay amount={data.registros.reduce((acc: number, r: any) => acc + r.horas * parseFloat(r.tarifa), 0).toFixed(2)} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CRONOGRAMA */}
            {tipo === "cronograma" && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Tareas ordenadas por Inicio Planificado</p>
                {data.tareas.map((t: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{t.nombre}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.inicio} → {t.fin}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-slate-200 h-2 rounded-full max-w-[200px] overflow-hidden">
                          <div className={`h-full rounded-full ${t.progreso === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${t.progreso}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{t.progreso}%</span>
                      </div>
                    </div>
                    <Badge className={`text-[9px] shrink-0 ${t.estado === "TERMINADA" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : t.estado === "EN_CURSO" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-500"}`}>
                      {t.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* PRESUPUESTO */}
            {tipo === "presupuesto" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Distribución de Costos</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={data.torta} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {data.torta.map((entry: any, index: number) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `Bs. ${v.toLocaleString("es-BO")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Salud Financiera</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Presupuesto Planificado</p>
                        <MoneyDisplay amount={data.plannedTotal} className="text-xl font-extrabold text-slate-800" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Costo Actual</p>
                        <MoneyDisplay amount={data.actualTotal} className="text-xl font-extrabold text-indigo-700" />
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-[10px] text-slate-400 uppercase">Diferencia (Saldo)</p>
                        <p className="text-lg font-extrabold text-emerald-600">
                          <MoneyDisplay amount={(parseFloat(data.plannedTotal) - parseFloat(data.actualTotal)).toFixed(2)} colored />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 block" />
                      Salud Financiera: Dentro del presupuesto
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
