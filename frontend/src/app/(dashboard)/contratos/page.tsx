"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  FileText,
  User,
  Building,
  TrendingUp,
  CreditCard,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useCommercialStore } from "@/store/commercial-store"
import { formatMoney } from "@/lib/money"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"

const MONTO_CUOTA_INICIAL = "203000.00"
const MONTO_SALDO_FINANCIAR = "812000.00"
const MONTO_CUOTA_MENSUAL = "33833.33"

const PLAN_PAGOS_MOCK = [
  { nro: 1, vencimiento: "2026-06-10", monto: MONTO_CUOTA_MENSUAL, estado: "PENDIENTE" },
  { nro: 2, vencimiento: "2026-07-10", monto: MONTO_CUOTA_MENSUAL, estado: "PENDIENTE" },
  { nro: 3, vencimiento: "2026-08-10", monto: MONTO_CUOTA_MENSUAL, estado: "PENDIENTE" },
]

export default function ContratoDetallePage() {
  const { session } = useAuthSession()
  const hasWritePermission = session?.permissions.includes(PERMISSIONS.CONTRACTS_WRITE)

  const { contratos, clientes, inmuebles, firmarContrato } = useCommercialStore()

  // Para este MVP, tomamos el primer contrato para mostrar su detalle
  const contrato = contratos[0]
  
  if (!contrato) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        No hay contratos disponibles.
      </div>
    )
  }

  const cliente = clientes.find(c => c.id === contrato.clienteId)
  const inmueble = inmuebles.find(i => i.id === contrato.inmuebleId)

  const handleFirmar = () => {
    firmarContrato(contrato.id)
    toast.success("Contrato Firmado con éxito", {
      description: "El estado del cliente y del inmueble han sido actualizados.",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Barra superior de acciones */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Contrato {contrato.codigo}
                </h1>
                {contrato.estado === "FIRMADO" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-2xs">
                    <CheckCircle className="h-3 w-3 text-emerald-500 fill-emerald-50" />
                    FIRMADO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-2xs">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    EN REVISIÓN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tipo: Compraventa con Financiamiento Directo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Imprimir
            </Button>
            
            {/* Solo permitir firmar si está en REVISION y tiene permisos */}
            {contrato.estado === "REVISION" && hasWritePermission && (
              <Button
                onClick={handleFirmar}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Firmar Contrato
              </Button>
            )}
            {contrato.estado === "FIRMADO" && (
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">
                <Download className="h-4 w-4 mr-1" />
                Descargar PDF Final
              </Button>
            )}
          </div>
        </div>

        {/* Panel Resumen de 3 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Cliente */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="h-4 w-4 text-indigo-500" />
              Datos del Adquirente
            </h2>
            <div className="space-y-2.5">
              <div>
                <span className="block text-[10px] text-slate-400 font-medium">Nombre Completo</span>
                <span className="text-sm font-semibold text-slate-800">{cliente?.nombre || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium">CI / Documento</span>
                  <span className="text-sm font-semibold text-slate-700">{cliente?.documento || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium">Estado Cliente</span>
                  <span className="text-sm font-semibold text-slate-700">{cliente?.estado}</span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-medium">Correo Electrónico</span>
                <span className="text-sm font-semibold text-slate-700">{cliente?.email}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Inmueble */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-indigo-500" />
              Inmueble Adquirido
            </h2>
            <div className="space-y-2.5">
              <div>
                <span className="block text-[10px] text-slate-400 font-medium">Identificación</span>
                <span className="text-sm font-semibold text-slate-800">{inmueble?.nombre || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-medium">Proyecto</span>
                <span className="text-sm font-semibold text-slate-700">{inmueble?.proyecto || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium">Código / Estado</span>
                  <span className="text-sm font-semibold text-slate-700">{inmueble?.codigo} - {inmueble?.estado}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium">Ubicación</span>
                  <span className="text-sm font-semibold text-slate-700">{inmueble?.ubicacion}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Financiero */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Resumen Financiero
            </h2>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span className="text-xs text-slate-500">Precio de Venta</span>
                <span className="text-sm font-bold text-slate-800">
                  {formatMoney(contrato.montoTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span className="text-xs text-slate-500">Cuota Inicial (Aprox)</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {formatMoney(MONTO_CUOTA_INICIAL)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100/50">
                <span className="text-[11px] font-semibold text-slate-500">Mensualidad Referencial</span>
                <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 border border-slate-200 rounded">
                  {formatMoney(MONTO_CUOTA_MENSUAL)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cláusulas JSON Viewer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
           <h3 className="text-sm font-bold text-slate-800 mb-3">Cláusulas Especiales (JSON)</h3>
           <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto">
             {JSON.stringify(contrato.clausulas, null, 2)}
           </pre>
        </div>

        {/* Plan de Pagos Detallado */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                Cronograma y Plan de Pagos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Muestra parcial de las cuotas programadas.
              </p>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-slate-50/20">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-500 py-3.5 px-6 w-[80px]">Nro</TableHead>
                <TableHead className="font-bold text-slate-500 py-3.5 px-6">Vencimiento</TableHead>
                <TableHead className="font-bold text-slate-500 py-3.5 px-6 text-right">Monto de Pago</TableHead>
                <TableHead className="font-bold text-slate-500 py-3.5 px-6">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLAN_PAGOS_MOCK.map((cuota) => (
                <TableRow
                  key={cuota.nro}
                  className="hover:bg-slate-50/60 border-b border-slate-100 transition-colors"
                >
                  <TableCell className="py-4 px-6 font-mono text-xs text-slate-500 font-semibold">
                    #{String(cuota.nro).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="py-4 px-6 font-medium text-slate-700">
                    {cuota.vencimiento}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right font-bold text-slate-800">
                    {formatMoney(cuota.monto)}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase bg-amber-50 text-amber-700 border-amber-200">
                      {cuota.estado}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  )
}
