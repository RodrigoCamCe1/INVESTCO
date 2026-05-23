"use client"

import * as React from "react"
import { Clock, Eye, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BannerDemo } from "@/components/banner-demo"

type AuditAction = "CREATE" | "UPDATE" | "SIGN" | "DELETE"
type AuditEntity = "Contrato" | "Presupuesto" | "Inmueble" | "Reserva" | "Usuario" | "Proyecto"

interface AuditLog {
  id: string
  usuario: string
  accion: AuditAction
  entidad: AuditEntity
  entidadId: string
  fecha: string
  hora: string
  beforeJson: object | null
  afterJson: object | null
}

const LOGS: AuditLog[] = [
  { id: "AUD-001", usuario: "admin@investco.com", accion: "SIGN", entidad: "Contrato", entidadId: "CTR-0012", fecha: "23/05/2026", hora: "09:14:32",
    beforeJson: { estado: "RESERVADO" },
    afterJson: { estado: "VENDIDO", firmaFecha: "23/05/2026", notario: "Dr. J. Romero" } },
  { id: "AUD-002", usuario: "ventas@investco.com", accion: "CREATE", entidad: "Reserva", entidadId: "RSV-0089", fecha: "22/05/2026", hora: "16:05:11",
    beforeJson: null,
    afterJson: { clienteId: "CLI-044", inmuebleId: "INM-007", monto: "15000.00", estado: "ACTIVA" } },
  { id: "AUD-003", usuario: "admin@investco.com", accion: "UPDATE", entidad: "Presupuesto", entidadId: "PRE-PRJ-PIRAI", fecha: "21/05/2026", hora: "11:23:55",
    beforeJson: { total: "4700000.00", version: 2 },
    afterJson: { total: "4850000.00", version: 3, motivo: "Incremento en costos de acero" } },
  { id: "AUD-004", usuario: "proyecto@investco.com", accion: "UPDATE", entidad: "Proyecto", entidadId: "PRJ-PIRAI", fecha: "20/05/2026", hora: "08:45:00",
    beforeJson: { etapa: "OBRA_BRUTA", progressBruta: 55 },
    afterJson: { etapa: "OBRA_BRUTA", progressBruta: 65 } },
  { id: "AUD-005", usuario: "admin@investco.com", accion: "DELETE", entidad: "Inmueble", entidadId: "INM-LEGACY-01", fecha: "19/05/2026", hora: "14:00:00",
    beforeJson: { codigo: "INM-LEGACY-01", estado: "DISPONIBLE", tipo: "Lote" },
    afterJson: null },
  { id: "AUD-006", usuario: "ventas@investco.com", accion: "UPDATE", entidad: "Contrato", entidadId: "CTR-0010", fecha: "18/05/2026", hora: "10:10:10",
    beforeJson: { cuota: "2500.00" },
    afterJson: { cuota: "2800.00", motivo: "Ajuste por IPC" } },
]

const ACTION_STYLE: Record<AuditAction, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
  SIGN:   "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
}

export default function AuditoriaPage() {
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  const [search, setSearch] = React.useState("")
  const [filterAction, setFilterAction] = React.useState<AuditAction | "TODAS">("TODAS")
  const [viewLog, setViewLog] = React.useState<AuditLog | null>(null)

  const filtered = LOGS.filter(l => {
    const matchSearch = l.usuario.includes(search) || l.entidadId.includes(search) || l.entidad.toLowerCase().includes(search.toLowerCase())
    const matchAction = filterAction === "TODAS" || l.accion === filterAction
    return matchSearch && matchAction
  })

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">

        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Auditoría de Cambios</h1>
            <p className="text-sm text-slate-500 mt-0.5">Trazabilidad completa de operaciones críticas del sistema (CU#40).</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuario, entidad o ID..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-slate-400" />
            {(["TODAS","CREATE","UPDATE","SIGN","DELETE"] as const).map(a => (
              <button key={a} onClick={() => setFilterAction(a)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${filterAction === a ? (a === "TODAS" ? "bg-slate-800 text-white border-slate-800" : ACTION_STYLE[a as AuditAction] + " ring-1 ring-current") : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 z-0" />
          <div className="space-y-4">
            {filtered.map(log => (
              <div key={log.id} className="relative flex items-start gap-4 pl-2">
                {/* Dot */}
                <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm shrink-0 mt-3 z-10 ${
                  log.accion === "CREATE" ? "bg-emerald-400" : log.accion === "UPDATE" ? "bg-amber-400" : log.accion === "SIGN" ? "bg-indigo-400" : "bg-red-400"
                }`} />

                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge className={`text-[9px] uppercase font-bold ${ACTION_STYLE[log.accion]}`}>{log.accion}</Badge>
                        <span className="text-sm font-bold text-slate-800">{log.entidad}</span>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{log.entidadId}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Por: <span className="font-semibold text-slate-700">{log.usuario}</span>
                        <span className="mx-2 text-slate-300">·</span>
                        {log.fecha} a las {log.hora}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setViewLog(log)}
                      className="h-7 text-[10px] shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                      <Eye className="h-3 w-3 mr-1" /> Ver Cambios
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No se encontraron logs con esos filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      <Dialog open={!!viewLog} onOpenChange={v => !v && setViewLog(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-indigo-600" />
              Trazabilidad — {viewLog?.accion} en {viewLog?.entidad} ({viewLog?.entidadId})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Estado ANTES (beforeJson)</p>
              <pre className={`text-xs rounded-xl p-4 overflow-auto max-h-40 font-mono leading-relaxed ${viewLog?.beforeJson ? "bg-red-50 border border-red-100 text-red-900" : "bg-slate-100 text-slate-400 italic"}`}>
                {viewLog?.beforeJson ? JSON.stringify(viewLog.beforeJson, null, 2) : "null — Registro creado (no existía previamente)"}
              </pre>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Estado DESPUÉS (afterJson)</p>
              <pre className={`text-xs rounded-xl p-4 overflow-auto max-h-40 font-mono leading-relaxed ${viewLog?.afterJson ? "bg-emerald-50 border border-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-400 italic"}`}>
                {viewLog?.afterJson ? JSON.stringify(viewLog.afterJson, null, 2) : "null — Registro eliminado"}
              </pre>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 flex gap-4 flex-wrap">
              <span>ID Log: <strong className="text-slate-700 font-mono">{viewLog?.id}</strong></span>
              <span>Usuario: <strong className="text-slate-700">{viewLog?.usuario}</strong></span>
              <span>Fecha: <strong className="text-slate-700">{viewLog?.fecha} {viewLog?.hora}</strong></span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
