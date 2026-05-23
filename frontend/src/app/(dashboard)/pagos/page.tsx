"use client"

import * as React from "react"
import { toast } from "sonner"
import { BriefcaseBusiness, Landmark, UserPlus, FileSignature, ArrowRightLeft, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BannerDemo } from "@/components/banner-demo"
import { formatMoney } from "@/lib/money"
import { addMoney } from "@/lib/decimal-utils"

type TipoPago = "DESEMBOLSO_BANCO" | "PAGO_CLIENTE" | "PAGO_PROVEEDOR"

interface PagoRecord {
  id: string
  tipo: TipoPago
  monto: string
  fecha: string
  referenciaId: string
  idempotencyKey: string
}

const INITIAL_PAGOS: PagoRecord[] = [
  { id: "TX-9001", tipo: "DESEMBOLSO_BANCO", monto: "1250000.00", fecha: "01/05/2026", referenciaId: "CTR-BCP-001", idempotencyKey: "mock-uuid-1" },
  { id: "TX-9002", tipo: "PAGO_PROVEEDOR", monto: "26250.00", fecha: "06/05/2026", referenciaId: "PRV-001", idempotencyKey: "mock-uuid-2" },
]

export default function PagosPage() {
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  const [pagos, setPagos] = React.useState<PagoRecord[]>(INITIAL_PAGOS)

  const [tipo, setTipo] = React.useState<TipoPago>("DESEMBOLSO_BANCO")
  const [monto, setMonto] = React.useState("")
  const [referenciaId, setReferenciaId] = React.useState("")

  // Balance simulado
  const ingresos = pagos.filter(p => p.tipo !== "PAGO_PROVEEDOR").reduce((acc, p) => addMoney(acc, p.monto), "0.00")
  const egresos = pagos.filter(p => p.tipo === "PAGO_PROVEEDOR").reduce((acc, p) => addMoney(acc, p.monto), "0.00")
  const balance = (parseFloat(ingresos) - parseFloat(egresos)).toFixed(2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto || !referenciaId) {
      toast.error("Complete el monto y la referencia")
      return
    }
    if (isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      toast.error("Ingrese un monto válido (string parseable)")
      return
    }

    const idempotencyKey = crypto.randomUUID()
    const newPago: PagoRecord = {
      id: `TX-${Date.now()}`,
      tipo,
      monto: parseFloat(monto).toFixed(2), // Guardamos siempre como string con 2 decimales
      fecha: new Date().toLocaleDateString("es-BO"),
      referenciaId,
      idempotencyKey
    }

    setPagos([newPago, ...pagos])
    toast.success("Pago registrado exitosamente", {
      description: `Idempotency-Key: ${idempotencyKey}`
    })
    setMonto("")
    setReferenciaId("")
  }

  const handleSimularDesembolso = () => {
    const idempotencyKey = crypto.randomUUID()
    const newPago: PagoRecord = {
      id: `TX-${Date.now()}`,
      tipo: "DESEMBOLSO_BANCO",
      monto: "500000.00",
      fecha: new Date().toLocaleDateString("es-BO"),
      referenciaId: "CREDITO-MOCK-999",
      idempotencyKey
    }
    setPagos([newPago, ...pagos])
    toast.success("🏦 Desembolso Bancario Simulado", {
      description: `Ingresaron Bs. 500,000.00 (Key: ${idempotencyKey.split('-')[0]})`
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tesorería y Pagos</h1>
              <p className="text-sm text-slate-500 mt-1">Gestión de ingresos, egresos e Idempotencia (CU#33, #34).</p>
            </div>
          </div>
          <Button onClick={handleSimularDesembolso} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Landmark className="h-4 w-4 mr-2" /> Simular Desembolso Bancario
          </Button>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs uppercase font-bold text-slate-400 mb-1">Ingresos Totales</p>
            <p className="text-2xl font-black text-emerald-600">{formatMoney(ingresos)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs uppercase font-bold text-slate-400 mb-1">Egresos Totales</p>
            <p className="text-2xl font-black text-red-600">{formatMoney(egresos)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
            <p className="text-xs uppercase font-bold text-slate-400 mb-1">Balance Actual</p>
            <p className="text-2xl font-black text-white">{formatMoney(balance)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Polimórfico */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 sticky top-6">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
                Registrar Movimiento
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de Movimiento *</label>
                  <select 
                    value={tipo} 
                    onChange={(e) => { setTipo(e.target.value as TipoPago); setReferenciaId("") }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-400"
                  >
                    <option value="DESEMBOLSO_BANCO">Desembolso Banco (Ingreso)</option>
                    <option value="PAGO_CLIENTE">Pago de Cliente (Ingreso)</option>
                    <option value="PAGO_PROVEEDOR">Pago a Proveedor (Egreso)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {tipo === "DESEMBOLSO_BANCO" && "ID de Contrato Bancario / Línea *"}
                    {tipo === "PAGO_CLIENTE" && "ID de Cliente *"}
                    {tipo === "PAGO_PROVEEDOR" && "ID de Proveedor (Razón Social) *"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      {tipo === "DESEMBOLSO_BANCO" && <Landmark className="h-4 w-4" />}
                      {tipo === "PAGO_CLIENTE" && <UserPlus className="h-4 w-4" />}
                      {tipo === "PAGO_PROVEEDOR" && <FileSignature className="h-4 w-4" />}
                    </div>
                    <input 
                      value={referenciaId} 
                      onChange={e => setReferenciaId(e.target.value)}
                      placeholder={tipo === "PAGO_PROVEEDOR" ? "Ej. PRV-001" : "Ej. CLI-102"}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monto (String) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-bold text-sm">Bs.</span>
                    </div>
                    <input 
                      type="number"
                      step="0.01"
                      value={monto} 
                      onChange={e => setMonto(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Procesar Movimiento
                </Button>
                <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                  <KeyRound className="h-3 w-3" /> Generará Idempotency-Key UUID v4
                </p>
              </div>
            </form>
          </div>

          {/* Historial de Movimientos */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden h-full">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">Historial de Movimientos</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {pagos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No hay movimientos registrados
                  </div>
                ) : (
                  pagos.map(p => (
                    <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                          p.tipo === "PAGO_PROVEEDOR" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {p.tipo === "DESEMBOLSO_BANCO" && <Landmark className="h-5 w-5" />}
                          {p.tipo === "PAGO_CLIENTE" && <UserPlus className="h-5 w-5" />}
                          {p.tipo === "PAGO_PROVEEDOR" && <FileSignature className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{p.tipo.replace("_", " ")}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[9px] font-mono text-slate-500 bg-white">
                              Ref: {p.referenciaId}
                            </Badge>
                            <span className="text-[10px] text-slate-400">{p.fecha}</span>
                          </div>
                          <p className="text-[9px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                            <KeyRound className="h-2.5 w-2.5" /> {p.idempotencyKey}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-base font-black ${p.tipo === "PAGO_PROVEEDOR" ? "text-red-600" : "text-emerald-600"}`}>
                          {p.tipo === "PAGO_PROVEEDOR" ? "-" : "+"}{formatMoney(p.monto)}
                        </p>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {p.tipo === "PAGO_PROVEEDOR" ? "Egreso" : "Ingreso"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
