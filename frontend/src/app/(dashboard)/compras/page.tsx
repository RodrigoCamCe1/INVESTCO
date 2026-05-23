"use client"

import * as React from "react"
import { toast } from "sonner"
import { ShoppingCart, CheckCircle2, ChevronRight, PackageCheck, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { addMoney, multiplyMoney } from "@/lib/decimal-utils"
import { formatMoney } from "@/lib/money"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"
import { BannerDemo } from "@/components/banner-demo"

type OCState = "BORRADOR" | "EN_APROBACION" | "APROBADA" | "RECIBIDA_PARCIAL" | "RECIBIDA_TOTAL"

interface OCLine {
  id: string
  descripcion: string
  cantidad: number
  precioUnitario: string
  recibido: number
}

interface OC {
  id: string
  proveedor: string
  fecha: string
  estado: OCState
  lineas: OCLine[]
}

const INITIAL_OCS: OC[] = [
  {
    id: "OC-2026-001",
    proveedor: "Cementos Caba S.A.",
    fecha: "05/05/2026",
    estado: "APROBADA",
    lineas: [
      { id: "L1", descripcion: "Cemento Portland IP-30 (Bolsas)", cantidad: 500, precioUnitario: "52.50", recibido: 0 },
    ],
  },
  {
    id: "OC-2026-002",
    proveedor: "Fierrosur SRL",
    fecha: "12/05/2026",
    estado: "RECIBIDA_PARCIAL",
    lineas: [
      { id: "L1", descripcion: "Acero Corrugado 12mm (Varillas)", cantidad: 1000, precioUnitario: "68.00", recibido: 400 },
      { id: "L2", descripcion: "Acero Liso 6mm (Rollos)", cantidad: 50, precioUnitario: "120.00", recibido: 50 },
    ],
  },
]

export default function ComprasPage() {
  const { session } = useAuthSession()
  const canApprove = session?.permissions.includes(PERMISSIONS.PURCHASE_ORDERS_WRITE) ?? false
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

  const [ocs, setOcs] = React.useState<OC[]>(INITIAL_OCS)
  
  // Create Modal
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newProv, setNewProv] = React.useState("")
  const [newLines, setNewLines] = React.useState<{ desc: string; qty: string; price: string }[]>([
    { desc: "", qty: "", price: "" }
  ])

  // Receive Modal
  const [receiveOpen, setReceiveOpen] = React.useState(false)
  const [activeOc, setActiveOc] = React.useState<OC | null>(null)
  const [receiveInput, setReceiveInput] = React.useState<Record<string, string>>({})

  // Compute Total of an OC
  const getOcTotal = (lineas: OCLine[]) => {
    return lineas.reduce((acc, l) => addMoney(acc, multiplyMoney(l.precioUnitario, l.cantidad)), "0.00")
  }

  const handleStateChange = (id: string, newState: OCState) => {
    setOcs(prev => prev.map(o => o.id === id ? { ...o, estado: newState } : o))
    toast.success(`Estado actualizado a ${newState.replace("_", " ")}`)
  }

  const handleCreateSubmit = () => {
    if (!newProv.trim() || newLines.some(l => !l.desc.trim() || !l.qty || !l.price)) {
      toast.error("Complete todos los campos requeridos")
      return
    }
    const oc: OC = {
      id: `OC-2026-00${ocs.length + 1}`,
      proveedor: newProv,
      fecha: new Date().toLocaleDateString("es-BO"),
      estado: "BORRADOR",
      lineas: newLines.map((l, i) => ({
        id: `L${i + 1}`,
        descripcion: l.desc,
        cantidad: parseInt(l.qty, 10),
        precioUnitario: l.price,
        recibido: 0,
      }))
    }
    setOcs([oc, ...ocs])
    setCreateOpen(false)
    setNewProv("")
    setNewLines([{ desc: "", qty: "", price: "" }])
    toast.success("Orden de Compra en Borrador creada")
  }

  const openReceive = (oc: OC) => {
    setActiveOc(oc)
    const inputs: Record<string, string> = {}
    oc.lineas.forEach(l => { inputs[l.id] = String(l.cantidad - l.recibido) })
    setReceiveInput(inputs)
    setReceiveOpen(true)
  }

  const handleReceiveSubmit = () => {
    if (!activeOc) return
    let isFullyReceived = true
    let isChanged = false
    
    const updatedLineas = activeOc.lineas.map(l => {
      const rec = parseInt(receiveInput[l.id] || "0", 10) || 0
      const totalRec = l.recibido + rec
      if (rec > 0) isChanged = true
      if (totalRec < l.cantidad) isFullyReceived = false
      return { ...l, recibido: totalRec > l.cantidad ? l.cantidad : totalRec }
    })

    if (!isChanged) {
      toast.error("Debe ingresar al menos una cantidad mayor a 0")
      return
    }

    const newState = isFullyReceived ? "RECIBIDA_TOTAL" : "RECIBIDA_PARCIAL"

    setOcs(prev => prev.map(o => o.id === activeOc.id ? { ...o, estado: newState, lineas: updatedLineas } : o))
    setReceiveOpen(false)
    toast.success(`Recepción registrada exitosamente. Estado: ${newState.replace("_", " ")}`)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
              Gestión de Órdenes de Compra
            </h1>
            <p className="text-sm text-slate-500 mt-1">Control de suministros y recepción de materiales.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Nueva Orden de Compra
          </Button>
        </div>

        <div className="space-y-4">
          {ocs.map(oc => {
            const total = getOcTotal(oc.lineas)
            return (
              <div key={oc.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-800 text-sm">{oc.id}</span>
                      <Badge variant="outline" className={`text-[9px] uppercase font-bold
                        ${oc.estado === "BORRADOR" ? "bg-slate-100 text-slate-600" 
                        : oc.estado === "EN_APROBACION" ? "bg-amber-100 text-amber-700" 
                        : oc.estado === "APROBADA" ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"}`}>
                        {oc.estado.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{oc.proveedor}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Fecha: {oc.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Estimado</p>
                    <p className="text-lg font-black text-indigo-700">{formatMoney(total)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {oc.lineas.map(l => (
                    <div key={l.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                      <div className="flex-1">
                        <span className="font-medium text-slate-800">{l.descripcion}</span>
                        <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                          <span>Cant: {l.cantidad}</span>
                          <span>PU: {formatMoney(l.precioUnitario)}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-semibold text-slate-700">Subtotal: {formatMoney(multiplyMoney(l.precioUnitario, l.cantidad))}</p>
                        {oc.estado.startsWith("RECIBIDA") && (
                          <p className={`font-bold mt-1 ${l.recibido === l.cantidad ? "text-emerald-600" : "text-amber-600"}`}>
                            Recibido: {l.recibido} / {l.cantidad}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* State Machine Actions */}
                <div className="flex flex-wrap gap-2 pt-2 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl border-t border-slate-100">
                  {oc.estado === "BORRADOR" && (
                    <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700" onClick={() => handleStateChange(oc.id, "EN_APROBACION")}>
                      Solicitar Aprobación
                    </Button>
                  )}
                  {oc.estado === "EN_APROBACION" && canApprove && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStateChange(oc.id, "APROBADA")}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Aprobar OC
                    </Button>
                  )}
                  {(oc.estado === "APROBADA" || oc.estado === "RECIBIDA_PARCIAL") && (
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => openReceive(oc)}>
                      <PackageCheck className="h-4 w-4 mr-1.5" /> Registrar Recepción
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Creación Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Proveedor *</label>
              <input value={newProv} onChange={e => setNewProv(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nombre del proveedor" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-600">Líneas de Material *</label>
                <Button size="sm" variant="ghost" onClick={() => setNewLines([...newLines, { desc: "", qty: "", price: "" }])} className="h-6 text-[10px]">
                  + Agregar Línea
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {newLines.map((l, i) => (
                  <div key={i} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <input value={l.desc} onChange={e => { const v = [...newLines]; v[i].desc = e.target.value; setNewLines(v) }} className="flex-1 border rounded px-2 py-1.5 text-xs" placeholder="Descripción" />
                    <input type="number" value={l.qty} onChange={e => { const v = [...newLines]; v[i].qty = e.target.value; setNewLines(v) }} className="w-16 border rounded px-2 py-1.5 text-xs" placeholder="Cant." />
                    <input value={l.price} onChange={e => { const v = [...newLines]; v[i].price = e.target.value; setNewLines(v) }} className="w-24 border rounded px-2 py-1.5 text-xs" placeholder="P. Unitario" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white">Crear Borrador</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recepción Modal */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Recepción de Materiales</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">Ingrese la cantidad recibida en esta entrega para la OC <strong>{activeOc?.id}</strong>.</p>
            <div className="space-y-3">
              {activeOc?.lineas.map(l => {
                const pend = l.cantidad - l.recibido
                if (pend <= 0) return null
                return (
                  <div key={l.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-semibold text-slate-800">{l.descripcion}</p>
                      <p className="text-[10px] text-slate-500">Pendiente: {pend} unidades</p>
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" 
                        min="0" 
                        max={pend}
                        value={receiveInput[l.id] || ""}
                        onChange={e => setReceiveInput({ ...receiveInput, [l.id]: e.target.value })}
                        className="w-full border rounded px-2 py-1 text-sm font-bold text-center focus:border-indigo-500" 
                        placeholder="0"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveOpen(false)}>Cancelar</Button>
            <Button onClick={handleReceiveSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmar Recepción</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
