"use client"

import * as React from "react"
import { toast } from "sonner"
import { CheckCircle2, Camera, Upload, User2, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export interface Actividad {
  id: string
  nombre: string
  etapa: "OBRA_BRUTA" | "OBRA_FINA"
  weight: number 
  percentComplete: number 
  encargado: string
  fechaInicio: string
  fechaFin: string
  estado: "PENDIENTE" | "EN_CURSO" | "TERMINADA"
  actualEnd?: string
}

interface Props {
  actividades: Actividad[]
  onUpdate: (id: string, nuevoProgreso: number, nuevoEstado: Actividad["estado"], actualEnd?: string) => void
  canWrite: boolean
}

export function SeguimientoAvance({ actividades, onUpdate, canWrite }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [actSel, setActSel] = React.useState<Actividad | null>(null)
  const [inputPct, setInputPct] = React.useState("")
  const [fotoNombre, setFotoNombre] = React.useState("")
  const [error, setError] = React.useState("")
  const [transicionOpen, setTransicionOpen] = React.useState(false)

  const handleOpen = (act: Actividad) => {
    setActSel(act)
    setInputPct(String(act.percentComplete))
    setError("")
    setFotoNombre("")
    setDialogOpen(true)
  }

  const handleGuardar = () => {
    if (!actSel) return
    const nuevo = parseInt(inputPct, 10)

    if (isNaN(nuevo) || nuevo < 0 || nuevo > 100) {
      setError("El porcentaje debe estar entre 0 y 100.")
      return
    }
    // Validar monotonía: no puede retroceder
    if (nuevo < actSel.percentComplete) {
      setError("No se admite regresión en el avance")
      return
    }

    const isTerminada = nuevo === 100
    const nuevoEstado = isTerminada ? "TERMINADA" : nuevo > 0 ? "EN_CURSO" : "PENDIENTE"
    const actualEnd = isTerminada ? new Date().toLocaleDateString("es-BO") : undefined

    onUpdate(actSel.id, nuevo, nuevoEstado, actualEnd)
    toast.success("Sincronizando con central... (Modo PWA Offline Ready)", {
      description: `${actSel.nombre} → ${nuevo}%`,
    })

    if (isTerminada && actSel.etapa === "OBRA_BRUTA") {
      setDialogOpen(false)
      setTransicionOpen(true)
    } else {
      setDialogOpen(false)
    }
  }

  const obrasBrutas = actividades.filter(a => a.etapa === "OBRA_BRUTA")
  const obrasFinas = actividades.filter(a => a.etapa === "OBRA_FINA")

  const renderGrupo = (grupo: Actividad[], label: string, color: string) => (
    <div>
      <h3 className={`text-xs font-bold uppercase tracking-wider ${color} mb-3 flex items-center gap-1.5`}>
        <span className={`h-2 w-2 rounded-full ${color.replace("text-", "bg-")}`} />
        {label}
      </h3>
      <div className="space-y-3">
        {grupo.map(act => {
          const pct = act.percentComplete
          const barColor = pct === 100 ? "bg-emerald-500" : act.etapa === "OBRA_BRUTA" ? "bg-indigo-500" : "bg-amber-500"
          return (
            <div key={act.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-xs transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-bold">{act.id}</span>
                    <span className="font-semibold text-slate-800 text-sm truncate">{act.nombre}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">Peso: {act.weight}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                    <User2 className="h-3 w-3" />{act.encargado}
                    <span>·</span>
                    <span>{act.fechaInicio} – {act.actualEnd || act.fechaFin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-9 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    act.estado === "TERMINADA" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : act.estado === "EN_CURSO" ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>
                    {act.estado.replace("_", " ")}
                  </span>
                  {canWrite && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={act.estado === "TERMINADA"}
                      onClick={() => handleOpen(act)}
                      className="text-[10px] h-7 px-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <ClipboardCheck className="h-3 w-3 mr-1" />
                      Reportar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderGrupo(obrasBrutas, "Obra Bruta", "text-indigo-600")}
      {renderGrupo(obrasFinas, "Obra Fina", "text-amber-600")}

      {/* Diálogo Reportar Avance */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-indigo-600" />
              Reportar Avance
            </DialogTitle>
            <DialogDescription>
              Actividad: <strong>{actSel?.nombre}</strong> — Avance actual: {actSel?.percentComplete}%
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nuevo porcentaje de avance *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={actSel?.percentComplete}
                  max={100}
                  value={inputPct}
                  onChange={e => { setInputPct(e.target.value); setError("") }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
                />
                <span className="text-slate-500 font-bold text-sm">%</span>
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
            </div>

            {/* Foto de evidencia (simulada) */}
            <div>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"
                onClick={() => document.getElementById("foto-upload")?.click()}
              >
                <Camera className="h-4 w-4" />
                Adjuntar Foto de Obra
              </Button>
              <input
                id="foto-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setFotoNombre(file.name)
                    toast.success("Foto adjuntada correctamente")
                  }
                }}
              />
              {fotoNombre && (
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {fotoNombre}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleGuardar} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Guardar Avance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo transición etapa */}
      <AlertDialog open={transicionOpen} onOpenChange={setTransicionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Etapa Completada
            </AlertDialogTitle>
            <AlertDialogDescription>
              La actividad alcanzó el <strong>100%</strong> en la etapa de <strong>Obra Bruta</strong>.
              ¿Desea finalizar esta etapa y transicionar el proyecto a <strong>Obra Fina</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction variant="outline" onClick={() => setTransicionOpen(false)}>Aún no</AlertDialogAction>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setTransicionOpen(false)
                toast.success("Transición a Obra Fina iniciada", { description: "El estado del proyecto ha sido actualizado." })
              }}
            >
              Transicionar a Obra Fina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
