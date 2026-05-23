"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Save, User2, Clock, CheckCircle2, AlertTriangle, Lock, ZoomIn, ZoomOut, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { formatMoney } from "@/lib/money"
import { useCommercialStore } from "@/store/commercial-store"

// ── Tipos ────────────────────────────────────────────────────────
interface Version { id: string; numero: string; fecha: string; autor: string; descripcion: string; isCurrent: boolean }
interface PresupuestoItem { id: string; categoria: string; descripcion: string; monto: string }

// ── Mocks estáticos ──────────────────────────────────────────────
const VERSIONES_MOCK: Version[] = [
  { id: "v3", numero: "v3", fecha: "2026-04-10", autor: "Arq. Gabriela Soto", descripcion: "Ajuste de ventanas y retiros normativos.", isCurrent: true },
  { id: "v2", numero: "v2", fecha: "2026-03-02", autor: "Ing. Carlos Méndez", descripcion: "Revisión estructural y cargas de viento.", isCurrent: false },
  { id: "v1", numero: "v1", fecha: "2026-01-15", autor: "Arq. Gabriela Soto", descripcion: "Diseño arquitectónico inicial aprobado.", isCurrent: false },
]

const ITEMS_PRESUPUESTO_BASE: PresupuestoItem[] = [
  { id: "P1", categoria: "Arquitectónico", descripcion: "Diseño y planos arquitectónicos", monto: "12000.00" },
  { id: "P2", categoria: "Estructural", descripcion: "Cálculos y planos estructurales", monto: "8500.00" },
  { id: "P3", categoria: "Eléctrico", descripcion: "Instalaciones eléctricas internas", monto: "6200.00" },
  { id: "P4", categoria: "Plomería", descripcion: "Red de agua fría/caliente y desagüe", monto: "5800.00" },
]

// Simula celdas del canvas para la rejilla visual
const GRID_ELEMENTS = [
  { id: "sala", label: "Sala", col: "col-span-2 row-span-2", bg: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "cocina", label: "Cocina", col: "col-span-1 row-span-1", bg: "bg-amber-50 border-amber-200 text-amber-700" },
  { id: "comedor", label: "Comedor", col: "col-span-1 row-span-1", bg: "bg-amber-50 border-amber-200 text-amber-700" },
  { id: "hab1", label: "Hab. Principal", col: "col-span-2 row-span-2", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { id: "hab2", label: "Hab. 2", col: "col-span-1 row-span-1", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { id: "hab3", label: "Hab. 3", col: "col-span-1 row-span-1", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { id: "bano1", label: "Baño 1", col: "col-span-1 row-span-1", bg: "bg-sky-50 border-sky-200 text-sky-700" },
  { id: "bano2", label: "Baño 2", col: "col-span-1 row-span-1", bg: "bg-sky-50 border-sky-200 text-sky-700" },
  { id: "garaje", label: "Garaje", col: "col-span-2 row-span-1", bg: "bg-slate-100 border-slate-300 text-slate-600" },
  { id: "jardin", label: "Jardín", col: "col-span-2 row-span-1", bg: "bg-lime-50 border-lime-200 text-lime-700" },
]

const USER_PRESENCES = [
  { nombre: "Arq. Gabriela Soto", rol: "Arquitecto", color: "bg-indigo-500", editando: true },
  { nombre: "Ing. Carlos Méndez", rol: "Ing. Estructural", color: "bg-emerald-500", editando: false },
]

export default function PlanoEditorPage() {
  const { id } = useParams<{ id: string }>()

  // ── Estado reactivo del presupuesto ──────────────────────────
  const [items, setItems] = React.useState<PresupuestoItem[]>(ITEMS_PRESUPUESTO_BASE)
  const [versionActual, setVersionActual] = React.useState("v3")
  const [especialidad, setEspecialidad] = React.useState("arquitectonico")
  const [conflictOpen, setConflictOpen] = React.useState(false)
  const [isStale] = React.useState(false) // Cambia a true para simular conflicto 409

  // ── Verificar si el contrato del inmueble asociado está FIRMADO ──
  const { contratos } = useCommercialStore()
  const contratoFirmado = contratos.find(c => c.estado === "FIRMADO")
  const esBloqueado = !!contratoFirmado

  // ── Total calculado ─────────────────────────────────────────
  const totalPresupuesto = items.reduce((sum, item) => sum + parseFloat(item.monto), 0).toFixed(2)

  const handleAddItem = (cat: string) => {
    const newItem: PresupuestoItem = {
      id: `P${Date.now()}`,
      categoria: cat,
      descripcion: "Nueva partida presupuestaria",
      monto: "2500.00",
    }
    setItems(prev => [...prev, newItem])
    toast.success("Partida añadida al presupuesto", { description: `Categoría: ${cat}` })
  }

  const handleUpdateMonto = (id: string, val: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, monto: val } : p))
  }

  const handleGuardar = () => {
    if (isStale) {
      setConflictOpen(true)
      return
    }
    toast.success("Cambios guardados", { description: `Versión ${versionActual} actualizada correctamente.` })
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* Barra superior del Editor */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Move className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">
              Editor de Plano — {id?.toUpperCase()}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Versión actual: {versionActual}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicadores de presencia WebSocket (simulado) */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            {USER_PRESENCES.map(u => (
              <div key={u.nombre} className="flex items-center gap-1.5 text-xs">
                <div className={`h-2 w-2 rounded-full ${u.color} ${u.editando ? "animate-pulse" : "opacity-50"}`} />
                <span className={`font-medium ${u.editando ? "text-slate-800" : "text-slate-400"}`}>
                  {u.nombre.split(" ")[1]}
                </span>
                {u.editando && <span className="text-indigo-500 font-semibold">editando...</span>}
              </div>
            ))}
          </div>

          {esBloqueado ? (
            <Badge className="bg-red-50 text-red-700 border-red-200 gap-1 px-3 py-1.5">
              <Lock className="h-3.5 w-3.5" /> Plano bloqueado por contrato firmado
            </Badge>
          ) : (
            <>
              <Button variant="outline" size="sm" className="text-xs gap-1"><ZoomOut className="h-3.5 w-3.5" />-</Button>
              <Button variant="outline" size="sm" className="text-xs gap-1"><ZoomIn className="h-3.5 w-3.5" />+</Button>
              <Button
                onClick={handleGuardar}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 font-semibold"
              >
                <Save className="h-3.5 w-3.5" />
                Guardar Cambios
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Aviso de plano bloqueado */}
      {esBloqueado && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center gap-2 text-sm text-red-700 font-medium">
          <Lock className="h-4 w-4 shrink-0" />
          Este plano está en <strong>Modo Lectura</strong>. Un contrato asociado ha sido firmado (
          {contratoFirmado?.codigo}). No se permiten modificaciones.
        </div>
      )}

      {/* Layout de 3 columnas */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel Izquierdo: Versiones ────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Historial de Versiones</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {VERSIONES_MOCK.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setVersionActual(v.numero)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    versionActual === v.numero
                      ? "border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700 uppercase">{v.numero}</span>
                    {v.isCurrent && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        ACTUAL
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mb-2">{v.descripcion}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <User2 className="h-3 w-3" />
                    <span className="truncate">{v.autor.split(" ")[1]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{v.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* ── Centro: Canvas + Pestañas ────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          <div className="p-4 flex-1 overflow-auto">
            <Tabs value={especialidad} onValueChange={setEspecialidad}>
              <TabsList className="mb-4 bg-white border border-slate-200 shadow-xs h-auto flex-wrap gap-1 p-1 rounded-xl">
                <TabsTrigger value="arquitectonico" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Arquitectónico
                </TabsTrigger>
                <TabsTrigger value="estructural" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Estructural
                </TabsTrigger>
                <TabsTrigger value="electrico" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Eléctrico
                </TabsTrigger>
                <TabsTrigger value="plomeria" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Plomería
                </TabsTrigger>
                <TabsTrigger value="carpinteria" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Carpintería
                </TabsTrigger>
              </TabsList>

              {/* Canvas simulado con rejilla */}
              {["arquitectonico", "estructural", "electrico", "plomeria", "carpinteria"].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-4 shadow-inner">
                    {/* Leyenda del tab activo */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          tab === "arquitectonico" ? "bg-blue-500" :
                          tab === "estructural" ? "bg-orange-500" :
                          tab === "electrico" ? "bg-yellow-500" :
                          tab === "plomeria" ? "bg-cyan-500" : "bg-amber-700"
                        }`} />
                        <span className="text-xs font-semibold text-slate-600 capitalize">Capa: {tab}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Escala 1:100 · {VERSIONES_MOCK.find(v => v.numero === versionActual)?.fecha}</span>
                    </div>

                    {/* Rejilla visual tipo plano */}
                    <div className="grid grid-cols-4 grid-rows-5 gap-1.5 h-80 auto-rows-fr">
                      {GRID_ELEMENTS.map(el => (
                        <div
                          key={el.id}
                          className={`${el.col} ${el.bg} border-2 rounded-lg flex items-center justify-center font-semibold text-xs transition-all hover:opacity-80 cursor-default select-none`}
                        >
                          {el.label}
                          {tab === "electrico" && (el.id === "sala" || el.id === "hab1") && (
                            <span className="ml-1 text-yellow-500">⚡</span>
                          )}
                          {tab === "plomeria" && (el.id === "bano1" || el.id === "bano2") && (
                            <span className="ml-1 text-cyan-500">💧</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-center text-[10px] text-slate-400">
                      Canvas interactivo (simulado) · Modo: {esBloqueado ? "Lectura" : "Edición"} · Especialidad: <strong>{tab}</strong>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>

        {/* ── Panel Derecho: Presupuesto ───────────────────────── */}
        <aside className="w-72 shrink-0 bg-white border-l border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Presupuesto Estimado</h2>
            {!esBloqueado && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddItem(
                  ["Eléctrico", "Plomería", "Carpintería", "Vidriería"][Math.floor(Math.random() * 4)]
                )}
                className="text-[10px] h-6 px-2"
              >
                + Partida
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {items.map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[9px] bg-slate-100 text-slate-600 border-slate-200">
                      {item.categoria}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{item.descripcion}</p>
                  <input
                    type="number"
                    value={item.monto}
                    disabled={esBloqueado}
                    onChange={e => handleUpdateMonto(item.id, e.target.value)}
                    className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-[10px] text-indigo-600 font-semibold text-right">{formatMoney(item.monto)}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Total */}
          <div className="border-t border-slate-200 p-4 bg-indigo-50/50 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Estimado</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xl font-extrabold text-indigo-700 tracking-tight">
              {formatMoney(totalPresupuesto)}
            </p>
            <p className="text-[10px] text-slate-400">
              Base para el Contrato de Venta (CU#9)
            </p>
          </div>
        </aside>
      </div>

      {/* Alert Dialog: Conflicto de versión (HTTP 409) */}
      <AlertDialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Conflicto de Versión — Error 409
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              <strong>Versión obsoleta.</strong> Otro usuario ha guardado cambios en este plano mientras
              usted editaba. Por favor, <strong>refresque la página</strong> para obtener la versión más
              reciente antes de continuar con sus modificaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { setConflictOpen(false); toast.info("Recargando versión actual...") }}
            >
              Refrescar Plano
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
