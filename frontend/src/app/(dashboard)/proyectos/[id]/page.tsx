"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Building, MapPin, DollarSign, Calendar, AlertTriangle,
  CheckCircle2, Clock, ShieldAlert, Activity,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/money"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"
import { SeguimientoAvance, Actividad } from "@/components/proyecto/seguimiento-avance"
import { ControlCalidad, QualityInspection, EstadoHallazgo } from "@/components/proyecto/control-calidad"
import { BannerDemo } from "@/components/banner-demo"

// ── Mock de proyecto ────────────────────────────────────────────
const PROYECTO_MOCK = {
  id: "PRJ-PIRAI",
  nombre: "Torre Piraí",
  ubicacion: "Equipetrol Norte, Santa Cruz de la Sierra",
  estado: "EN_EJECUCION" as const,
  etapaActual: "OBRA_BRUTA" as "OBRA_BRUTA" | "OBRA_FINA",
  presupuestoTotal: "4850000.00",
  costoActual: "1285000.00",
  desviacionPct: 4.2, 
  fechaInicioStr: "01/02/2026",
  fechaFinStr: "15/11/2026",
  delayDays: 8,
  encargado: "Ing. Roberto Méndez",
}

// ── Actividades Mock (5 Actividades) ──────────────
const ACTIVIDADES_INICIALES: Actividad[] = [
  { id: "AB-01", nombre: "Excavación y Cimientos", etapa: "OBRA_BRUTA", weight: 30, percentComplete: 100, encargado: "Ing. R. Méndez", fechaInicio: "01/02/2026", fechaFin: "28/02/2026", estado: "TERMINADA", actualEnd: "26/02/2026" },
  { id: "AB-02", nombre: "Estructura de Hormigón y Muros", etapa: "OBRA_BRUTA", weight: 40, percentComplete: 50, encargado: "Ing. R. Méndez", fechaInicio: "01/03/2026", fechaFin: "15/05/2026", estado: "EN_CURSO" },
  { id: "AB-03", nombre: "Techado y Cubierta", etapa: "OBRA_BRUTA", weight: 30, percentComplete: 0, encargado: "Ing. R. Méndez", fechaInicio: "16/05/2026", fechaFin: "15/06/2026", estado: "PENDIENTE" },
  { id: "AF-01", nombre: "Instalaciones Hidrosanitarias", etapa: "OBRA_FINA", weight: 50, percentComplete: 0, encargado: "Tec. J. Flores", fechaInicio: "16/06/2026", fechaFin: "15/08/2026", estado: "PENDIENTE" },
  { id: "AF-02", nombre: "Acabados y Pintura", etapa: "OBRA_FINA", weight: 50, percentComplete: 0, encargado: "Arq. S. Alarcón", fechaInicio: "16/08/2026", fechaFin: "30/09/2026", estado: "PENDIENTE" },
]

// ── Inspecciones Mock (3 inspecciones previas) ───────────
const INSPECCIONES_INICIALES: QualityInspection[] = [
  {
    id: "QI-101", fecha: "10/05/2026", inspector: "Ing. R. Méndez", stage: "OBRA_BRUTA",
    hallazgos: [
      { id: "F-001", descripcion: "Fisuras en muro portante eje C", severidad: "CRITICA", estado: "ABIERTA", accionCorrectiva: "Refuerzo estructural inmediato." },
      { id: "F-002", descripcion: "Desnivel en encofrado", severidad: "MEDIA", estado: "RESUELTA", accionCorrectiva: "Ajuste de puntales y nivelación topográfica." }
    ]
  },
  {
    id: "QI-102", fecha: "05/04/2026", inspector: "Arq. S. Alarcón", stage: "OBRA_BRUTA",
    hallazgos: [
      { id: "F-003", descripcion: "Calidad de mezcla de concreto subestándar", severidad: "GRAVE", estado: "EN_CORRECCION", accionCorrectiva: "Solicitar nuevo lote de cemento y pruebas de cilindro." }
    ]
  },
  {
    id: "QI-103", fecha: "20/02/2026", inspector: "Ing. R. Méndez", stage: "OBRA_BRUTA",
    hallazgos: [
      { id: "F-004", descripcion: "Material de relleno con exceso de humedad", severidad: "LEVE", estado: "RESUELTA", accionCorrectiva: "Secado al sol antes de compactación." }
    ]
  },
]

// ── Fórmula de avance global (CU#15) ─────────────────────────────────────
function calcAvanceGlobal(acts: Actividad[], etapaActual: "OBRA_BRUTA" | "OBRA_FINA"): number {
  const brutaActs = acts.filter(a => a.etapa === "OBRA_BRUTA")
  const finaActs = acts.filter(a => a.etapa === "OBRA_FINA")
  
  const progressBruta = brutaActs.reduce((sum, a) => sum + (a.percentComplete * a.weight) / 100, 0)
  const progressFina = finaActs.reduce((sum, a) => sum + (a.percentComplete * a.weight) / 100, 0)

  if (etapaActual === "OBRA_BRUTA") {
    return Math.round(15 + (progressBruta * 0.45))
  } else {
    return Math.round(60 + (progressFina * 0.35))
  }
}

// ── Semáforo ────────────────────────────────────────────────────
type SemaforoColor = "verde" | "amarillo" | "rojo"

function Semaforo({ color, label }: { color: SemaforoColor; label: string }) {
  const styles: Record<SemaforoColor, { bg: string; text: string; dot: string }> = {
    verde: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
    amarillo: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500 animate-pulse" },
    rojo: { bg: "bg-red-50 border-red-200", text: "text-red-700", dot: "bg-red-500 animate-pulse" },
  }
  const s = styles[color]
  return (
    <div className={`${s.bg} border rounded-xl px-3 py-2 flex items-center gap-2`}>
      <div className={`h-3 w-3 rounded-full ${s.dot}`} />
      <span className={`text-xs font-bold ${s.text}`}>{label}</span>
    </div>
  )
}

// ── ProgressRing SVG ────────────────────────────────────────────
function ProgressRing({ pct }: { pct: number }) {
  const r = 36; const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative h-24 w-24 flex items-center justify-center">
      <svg className="absolute rotate-[-90deg]" width={96} height={96}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
        <circle cx={48} cy={48} r={r} fill="none" stroke="#4f46e5" strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <div className="text-center">
        <span className="text-xl font-extrabold text-slate-900">{pct}%</span>
        <span className="block text-[9px] text-slate-400 uppercase tracking-wide">Global</span>
      </div>
    </div>
  )
}

export default function ProyectoDetallePage() {
  const params = useParams()
  const { session } = useAuthSession()
  const canWrite = session?.permissions.includes(PERMISSIONS.PROJECTS_WRITE) ?? false
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

  const [actividades, setActividades] = React.useState<Actividad[]>(ACTIVIDADES_INICIALES)
  const [inspecciones, setInspecciones] = React.useState<QualityInspection[]>(INSPECCIONES_INICIALES)
  
  // ── Cálculos reactivos ───────────────────────────────────────
  const avanceGlobal = calcAvanceGlobal(actividades, PROYECTO_MOCK.etapaActual)
  
  const hallazgosAbiertos = inspecciones.flatMap(i => i.hallazgos).filter(h => h.estado === "ABIERTA" || h.estado === "EN_CORRECCION")
  const tieneCriticaAbierta = hallazgosAbiertos.some(h => h.severidad === "CRITICA" && h.estado === "ABIERTA")
  
  const semaforoSalud: SemaforoColor = 
    hallazgosAbiertos.length === 0 ? "verde" : tieneCriticaAbierta ? "rojo" : "amarillo"

  // ── Handlers ────────────────────────────────────────────────
  const handleUpdateActividad = (id: string, nuevoProgreso: number, nuevoEstado: Actividad["estado"], actualEnd?: string) => {
    setActividades(prev => prev.map(a => a.id === id ? { ...a, percentComplete: nuevoProgreso, estado: nuevoEstado, actualEnd } : a))
  }

  const handleAddInspection = (insp: Omit<QualityInspection, "id">) => {
    setInspecciones(prev => [
      { ...insp, id: `QI-${Date.now()}` },
      ...prev,
    ])
  }

  const handleUpdateFindingState = (inspId: string, findingId: string, estado: EstadoHallazgo) => {
    setInspecciones(prev => prev.map(insp => {
      if (insp.id !== inspId) return insp
      return {
        ...insp,
        hallazgos: insp.hallazgos.map(h => h.id === findingId ? { ...h, estado } : h)
      }
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">

        {/* Alerta de Salud Crítica (CU#20) */}
        {tieneCriticaAbierta && (
          <div className="bg-red-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <p className="text-sm">SALUD DE PROYECTO CRÍTICA: Hallazgos de calidad pendientes.</p>
              <p className="text-xs font-normal opacity-90">Por favor resuelva los hallazgos críticos en la pestaña de calidad inmediatamente.</p>
            </div>
          </div>
        )}

        {/* ── ENCABEZADO ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            {/* Datos del proyecto */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                  {PROYECTO_MOCK.estado.replace("_", " ")}
                </span>
                <span className="text-[10px] font-mono text-slate-400">ID: {PROYECTO_MOCK.id}</span>
                <Badge className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                  {PROYECTO_MOCK.etapaActual.replace("_", " ")}
                </Badge>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Building className="h-6 w-6 text-indigo-600 shrink-0" />
                {PROYECTO_MOCK.nombre} — Tablero de Control
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {PROYECTO_MOCK.ubicacion}
              </p>
            </div>

            {/* Resumen Ejecutivo (CU#24, #25) */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div className="flex flex-col items-center px-4">
                <ProgressRing pct={avanceGlobal} />
              </div>

              <div className="space-y-2 border-l border-slate-200 pl-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />Salud de Calidad
                  </p>
                  <Semaforo color={semaforoSalud} label={hallazgosAbiertos.length > 0 ? `${hallazgosAbiertos.length} hallazgos abiertos` : "Calidad óptima"} />
                </div>
                <div className="pt-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />Presupuesto Total
                  </p>
                  <p className="text-sm font-extrabold text-slate-800">{formatMoney(PROYECTO_MOCK.presupuestoTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <Tabs defaultValue="actividades" className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-xs flex flex-wrap gap-1 h-auto">
            {[
              { val: "actividades", label: "Seguimiento de Avance", icon: <Activity className="h-3.5 w-3.5" /> },
              { val: "calidad", label: "Control de Calidad", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
            ].map(t => (
              <TabsTrigger key={t.val} value={t.val}
                className="text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white cursor-pointer">
                {t.icon}{t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Pestaña: Actividades */}
          <TabsContent value="actividades" className="mt-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />Gestión Operativa de Obra
                </h2>
              </div>
              <SeguimientoAvance actividades={actividades} onUpdate={handleUpdateActividad} canWrite={canWrite} />
            </div>
          </TabsContent>

          {/* Pestaña: Calidad */}
          <TabsContent value="calidad" className="mt-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <ControlCalidad
                inspecciones={inspecciones}
                onAddInspection={handleAddInspection}
                onUpdateFindingState={handleUpdateFindingState}
                canWrite={canWrite}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
