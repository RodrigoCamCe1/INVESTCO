"use client"

import * as React from "react"
import { toast } from "sonner"
import { Truck, Star, Ban, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BannerDemo } from "@/components/banner-demo"

interface Proveedor {
  id: string
  nombre: string
  nit: string
  contacto: string
  rating: number // 1 to 5
  activo: boolean
}

const INITIAL_PROVEEDORES: Proveedor[] = [
  { id: "PRV-001", nombre: "Cementos Caba S.A.", nit: "1029384756", contacto: "Juan Pérez (78945612)", rating: 5, activo: true },
  { id: "PRV-002", nombre: "Fierrosur SRL", nit: "5647382910", contacto: "María Gómez (71234567)", rating: 4, activo: true },
  { id: "PRV-003", nombre: "Ladrillos El Fuerte", nit: "9876543210", contacto: "Carlos Roca (76543210)", rating: 3, activo: true },
  { id: "PRV-004", nombre: "Pinturas Monopol S.A.", nit: "1122334455", contacto: "Ana Silva (79988776)", rating: 5, activo: false },
]

export default function ProveedoresPage() {
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  const [proveedores, setProveedores] = React.useState<Proveedor[]>(INITIAL_PROVEEDORES)

  const toggleStatus = (id: string, current: boolean) => {
    setProveedores(prev => prev.map(p => p.id === id ? { ...p, activo: !current } : p))
    if (current) {
      toast.info("Proveedor desactivado (Soft Delete)")
    } else {
      toast.success("Proveedor reactivado")
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < rating ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
    ))
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">
        
        <div className="flex items-center gap-2 mb-6">
          <Truck className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Catálogo de Proveedores</h1>
            <p className="text-sm text-slate-500 mt-1">Gestión de proveedores autorizados y evaluación (CU#36).</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Proveedor / Razón Social</th>
                  <th className="px-6 py-4">NIT</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proveedores.map(p => (
                  <tr key={p.id} className={`transition-colors hover:bg-slate-50/50 ${!p.activo ? "opacity-50 grayscale bg-slate-50" : ""}`}>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {p.nombre}
                      {!p.activo && <Badge variant="secondary" className="ml-2 text-[9px] bg-slate-200 text-slate-600">INACTIVO</Badge>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{p.nit}</td>
                    <td className="px-6 py-4 text-slate-600">{p.contacto}</td>
                    <td className="px-6 py-4 flex items-center gap-0.5 mt-2">
                      {renderStars(p.rating)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className={p.activo ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}
                        onClick={() => toggleStatus(p.id, p.activo)}
                      >
                        {p.activo ? <Ban className="h-3 w-3 mr-1.5" /> : <CheckCircle2 className="h-3 w-3 mr-1.5" />}
                        {p.activo ? "Desactivar" : "Reactivar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
