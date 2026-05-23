"use client"

import * as React from "react"
import { toast } from "sonner"
import { ShieldAlert, PlusCircle, CheckCircle2, RotateCcw, AlertTriangle, XCircle, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export type Severidad = "LEVE" | "MEDIA" | "GRAVE" | "CRITICA"
export type EstadoHallazgo = "ABIERTA" | "EN_CORRECCION" | "RESUELTA" | "RECHAZADA"

export interface QualityFinding {
  id: string
  descripcion: string
  severidad: Severidad
  estado: EstadoHallazgo
  accionCorrectiva?: string
}

export interface QualityInspection {
  id: string
  fecha: string
  inspector: string
  stage: "OBRA_BRUTA" | "OBRA_FINA" | "INSTALACIONES"
  hallazgos: QualityFinding[]
}

interface Props {
  inspecciones: QualityInspection[]
  onAddInspection: (i: Omit<QualityInspection, "id">) => void
  onUpdateFindingState: (inspectionId: string, findingId: string, estado: EstadoHallazgo) => void
  canWrite: boolean
}

const SEVERIDAD_STYLE: Record<Severidad, string> = {
  LEVE: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIA: "bg-amber-50 text-amber-700 border-amber-200",
  GRAVE: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICA: "bg-red-50 text-red-700 border-red-200 animate-pulse",
}

const ESTADO_STYLE: Record<EstadoHallazgo, string> = {
  ABIERTA: "bg-red-50 text-red-700 border-red-200",
  EN_CORRECCION: "bg-amber-50 text-amber-700 border-amber-200",
  RESUELTA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RECHAZADA: "bg-slate-100 text-slate-500 border-slate-200 line-through",
}

export function ControlCalidad({ inspecciones, onAddInspection, onUpdateFindingState, canWrite }: Props) {
  const [open, setOpen] = React.useState(false)
  const [inspector, setInspector] = React.useState("")
  const [stage, setStage] = React.useState<QualityInspection["stage"]>("OBRA_BRUTA")
  const [descripcion, setDescripcion] = React.useState("")
  const [severidad, setSeveridad] = React.useState<Severidad>("MEDIA")
  const [accionCorrectiva, setAccionCorrectiva] = React.useState("")
  const [formError, setFormError] = React.useState("")

  const handleGuardar = () => {
    setFormError("")
    if (!inspector.trim() || !descripcion.trim()) {
      setFormError("El inspector y la descripción del hallazgo son obligatorios.")
      return
    }
    
    const newFinding: QualityFinding = {
      id: `F-${Date.now()}`,
      descripcion,
      severidad,
      estado: "ABIERTA",
      accionCorrectiva: accionCorrectiva.trim() || undefined,
    }

    onAddInspection({
      fecha: new Date().toLocaleDateString("es-BO"),
      inspector,
      stage,
      hallazgos: [newFinding]
    })

    toast.success("Inspección de Calidad Registrada", {
      description: severidad === "CRITICA" || severidad === "GRAVE"
        ? "⚠️ Severidad elevada. Salud del proyecto actualizada."
        : "Hallazgo añadido a la matriz.",
    })
    
    setInspector(""); setStage("OBRA_BRUTA"); setDescripcion(""); setSeveridad("MEDIA"); setAccionCorrectiva("")
    setOpen(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          Inspecciones de Calidad (No Conformidades)
        </h3>
        {canWrite && (
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nueva Inspección
          </Button>
        )}
      </div>

      {inspecciones.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
          <p className="text-sm font-medium">Sin inspecciones registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspecciones.map(insp => (
            <div key={insp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-slate-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 mr-2">{insp.id}</span>
                    <Badge variant="secondary" className="text-[9px] uppercase">{insp.stage.replace("_", " ")}</Badge>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Inspector: <span className="text-slate-800">{insp.inspector}</span> • {insp.fecha}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {insp.hallazgos.map(h => (
                  <div key={h.id} className={`flex items-start justify-between gap-3 p-3 border rounded-lg ${h.severidad === 'CRITICA' && h.estado === 'ABIERTA' ? 'border-red-300 bg-red-50/30' : 'border-slate-100 bg-white'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${SEVERIDAD_STYLE[h.severidad]}`}>
                          {h.severidad}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${ESTADO_STYLE[h.estado]}`}>
                          {h.estado.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-snug">{h.descripcion}</p>
                      {h.accionCorrectiva && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="font-semibold block mb-0.5">Acción Correctiva Propuesta:</span>
                          {h.accionCorrectiva}
                        </div>
                      )}
                    </div>

                    {canWrite && h.estado !== "RESUELTA" && h.estado !== "RECHAZADA" && (
                      <div className="flex flex-col gap-1.5 shrink-0 min-w-[120px]">
                        {h.estado === "ABIERTA" && (
                          <Button size="sm" variant="outline"
                            onClick={() => { onUpdateFindingState(insp.id, h.id, "EN_CORRECCION"); toast.info("Hallazgo en corrección") }}
                            className="text-[10px] h-7 px-2 border-amber-200 text-amber-700 hover:bg-amber-50 w-full justify-start"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />En Corrección
                          </Button>
                        )}
                        {h.estado === "EN_CORRECCION" && (
                          <Button size="sm" variant="outline"
                            onClick={() => { onUpdateFindingState(insp.id, h.id, "RESUELTA"); toast.success("Hallazgo resuelto") }}
                            className="text-[10px] h-7 px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full justify-start"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />Resolver
                          </Button>
                        )}
                        <Button size="sm" variant="outline"
                          onClick={() => { onUpdateFindingState(insp.id, h.id, "RECHAZADA"); toast.info("Hallazgo rechazado") }}
                          className="text-[10px] h-7 px-2 border-slate-200 text-slate-500 hover:bg-slate-50 w-full justify-start"
                        >
                          <XCircle className="h-3 w-3 mr-1" />Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo Nueva Inspección */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Registrar Inspección de Calidad</DialogTitle>
            <DialogDescription>Añada una nueva inspección y un hallazgo detectado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inspector *</label>
                <input value={inspector} onChange={e => setInspector(e.target.value)}
                  placeholder="Ej. Ing. Pérez"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Etapa de Obra</label>
                <select value={stage} onChange={e => setStage(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                  <option value="OBRA_BRUTA">Obra Bruta</option>
                  <option value="OBRA_FINA">Obra Fina</option>
                  <option value="INSTALACIONES">Instalaciones</option>
                </select>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción del Hallazgo *</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2}
                placeholder="Describa el problema detectado..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Severidad</label>
              <div className="flex gap-2 flex-wrap">
                {(["LEVE", "MEDIA", "GRAVE", "CRITICA"] as Severidad[]).map(s => (
                  <button key={s} onClick={() => setSeveridad(s)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      severidad === s ? SEVERIDAD_STYLE[s] + " ring-2 ring-offset-1 ring-current" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Acción Correctiva (Opcional)</label>
              <textarea value={accionCorrectiva} onChange={e => setAccionCorrectiva(e.target.value)} rows={2}
                placeholder="Solución propuesta para el hallazgo..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
            </div>
            
            {formError && <p className="text-red-500 text-xs font-medium">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleGuardar} className="bg-red-600 hover:bg-red-700 text-white">Guardar Inspección</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
