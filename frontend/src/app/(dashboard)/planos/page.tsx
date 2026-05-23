"use client"

import * as React from "react"
import Link from "next/link"
import { FileArchive, Home, Building2, Layers, PlusCircle, Ruler, ChevronRight, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatMoney } from "@/lib/money"
import { useCommercialStore } from "@/store/commercial-store"

interface BlueprintModel {
  id: string; nombre: string; descripcion: string; tipo: "Vivienda" | "Dúplex" | "Lote Urbanizado"
  m2Estimados: number; presupuestoBase: string; especialidades: string[]; version: string
  fechaCreacion: string; inmuebleAsociadoId?: string
}

const MODELOS_MOCK: BlueprintModel[] = [
  { id: "BP-001", nombre: "Vivienda Minimalista — Tipo A", descripcion: "Modelo de vivienda unifamiliar de una planta. Diseño limpio, ventanas amplias y patios internos.", tipo: "Vivienda", m2Estimados: 180, presupuestoBase: "85000.00", especialidades: ["Arquitectónico", "Estructural", "Eléctrico"], version: "v3", fechaCreacion: "2026-01-15" },
  { id: "BP-002", nombre: "Dúplex Familiar — Tipo B", descripcion: "Modelo de dúplex para dos unidades independientes. Circulación vertical integrada y fachada moderna.", tipo: "Dúplex", m2Estimados: 280, presupuestoBase: "165000.00", especialidades: ["Arquitectónico", "Estructural", "Plomería", "Carpintería"], version: "v2", fechaCreacion: "2026-02-08" },
  { id: "BP-003", nombre: "Lote Urbanizado — Tipo C", descripcion: "Plano de subdivisión urbana con calles internas, retiros obligatorios y áreas verdes comunitarias.", tipo: "Lote Urbanizado", m2Estimados: 600, presupuestoBase: "38000.00", especialidades: ["Arquitectónico", "Topográfico"], version: "v1", fechaCreacion: "2026-03-01", inmuebleAsociadoId: "INM-001" },
  { id: "BP-004", nombre: "Casa Compacta — Tipo D", descripcion: "Diseño compacto de dos plantas para terrenos estrechos. Optimización de espacios y luz natural.", tipo: "Vivienda", m2Estimados: 130, presupuestoBase: "62000.00", especialidades: ["Arquitectónico", "Estructural", "Eléctrico", "Plomería"], version: "v4", fechaCreacion: "2026-03-22" },
]

export default function PlanosPage() {
  const { inmuebles } = useCommercialStore()
  const disponibles = inmuebles.filter(i => i.estado === "DISPONIBLE")
  const [asociarOpen, setAsociarOpen] = React.useState(false)
  const [planoSel, setPlanoSel] = React.useState<BlueprintModel | null>(null)
  const [inmSel, setInmSel] = React.useState("")
  const [asociaciones, setAsociaciones] = React.useState<Record<string, string>>(
    MODELOS_MOCK.reduce((a, m) => m.inmuebleAsociadoId ? { ...a, [m.id]: m.inmuebleAsociadoId } : a, {} as Record<string, string>)
  )

  const tipoIcon = { "Vivienda": <Home className="h-4 w-4 text-blue-500" />, "Dúplex": <Building2 className="h-4 w-4 text-purple-500" />, "Lote Urbanizado": <Layers className="h-4 w-4 text-emerald-500" /> }

  const openAsociar = (p: BlueprintModel) => { setPlanoSel(p); setInmSel(asociaciones[p.id] || ""); setAsociarOpen(true) }
  const confirmar = () => {
    if (!planoSel || !inmSel) return
    setAsociaciones(prev => ({ ...prev, [planoSel.id]: inmSel }))
    toast.success("Plano asociado", { description: `${planoSel.nombre} → ${disponibles.find(i => i.id === inmSel)?.nombre}` })
    setAsociarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="pb-5 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Catálogo de Planos y Modelos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de blueprints base para viviendas, dúplex y lotes. Vinculados al ciclo de venta.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODELOS_MOCK.map((m) => {
            const asocId = asociaciones[m.id]
            const inmuAsoc = asocId ? inmuebles.find(i => i.id === asocId) : null
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden">
                {/* Banner */}
                <div className="relative h-24 bg-linear-to-br from-indigo-600 to-violet-700 flex items-end p-4">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,.5) 19px,rgba(255,255,255,.5) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,.5) 19px,rgba(255,255,255,.5) 20px)" }} />
                  <div className="relative flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
                      <FileArchive className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-sm leading-tight">{m.nombre}</h2>
                      <div className="flex items-center gap-1.5 mt-0.5">{tipoIcon[m.tipo]}<span className="text-white/80 text-[11px]">{m.tipo}</span></div>
                    </div>
                  </div>
                  <span className="absolute top-2.5 right-3 text-[10px] font-bold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full">{m.version.toUpperCase()}</span>
                </div>

                {/* Cuerpo */}
                <div className="p-5 space-y-4">
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{m.descripcion}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1"><Ruler className="h-3 w-3 inline mr-1" />Superficie</span>
                      <span className="text-lg font-bold text-slate-800">{m.m2Estimados} m²</span>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                      <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-wider mb-1">Presupuesto Base</span>
                      <span className="text-sm font-bold text-indigo-700">{formatMoney(m.presupuestoBase)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.especialidades.map(e => <Badge key={e} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200">{e}</Badge>)}
                  </div>
                  {inmuAsoc && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-semibold">Asociado:</span>
                      <span className="truncate">{inmuAsoc.nombre}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Link href={`/planos/${m.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Abrir Editor <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                    <Button size="sm" onClick={() => openAsociar(m)} className="text-xs bg-slate-900 hover:bg-slate-800 text-white">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />Asociar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={asociarOpen} onOpenChange={setAsociarOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Asociar Plano a Inmueble</DialogTitle>
            <DialogDescription>Seleccione el inmueble DISPONIBLE para vincular con <strong>{planoSel?.nombre}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-2 max-h-60 overflow-y-auto">
            {disponibles.length === 0
              ? <p className="text-sm text-slate-400 text-center py-4">No hay inmuebles disponibles.</p>
              : disponibles.map(inm => (
                <div key={inm.id} onClick={() => setInmSel(inm.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all text-sm ${inmSel === inm.id ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-100" : "border-slate-200 hover:bg-slate-50"}`}>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">{inm.nombre}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{inm.codigo}</span>
                  </div>
                  <span className="text-xs text-slate-500">{inm.superficie} m² · {inm.ubicacion}</span>
                </div>
              ))
            }
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAsociarOpen(false)}>Cancelar</Button>
            <Button disabled={!inmSel} onClick={confirmar} className="bg-indigo-600 hover:bg-indigo-700 text-white">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
