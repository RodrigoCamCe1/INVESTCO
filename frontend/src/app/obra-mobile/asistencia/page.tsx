"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ClipboardCheck, BarChart2, CheckCircle2, XCircle, Clock, Send, HardHat, WifiOff, Wifi } from "lucide-react"

// ── Enum tipado estrictamente ────────────────────────────────────
type AttendanceStatus = "PRESENTE" | "FALTA" | "PERMISO" | "VACACION"

interface Trabajador {
  id: string
  nombre: string
  rol: string
  estado: AttendanceStatus
}

const TRABAJADORES_INIT: Trabajador[] = [
  { id: "W-01", nombre: "Roberto Méndez", rol: "Ing. Residente", estado: "PRESENTE" },
  { id: "W-02", nombre: "José Flores", rol: "Técnico Instalaciones", estado: "PRESENTE" },
  { id: "W-03", nombre: "Sofía Alarcón", rol: "Arquitecta Acabados", estado: "FALTA" },
  { id: "W-04", nombre: "Marco Antezana", rol: "Operador Grúa", estado: "PRESENTE" },
  { id: "W-05", nombre: "Luisa Torrez", rol: "Ayudante Albañilería", estado: "PERMISO" },
]

const STATUS_BTN: { status: AttendanceStatus; label: string; active: string; icon: React.ReactNode }[] = [
  { status: "PRESENTE", label: "Presente", active: "bg-emerald-600 text-white border-emerald-600", icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: "FALTA",    label: "Falta",    active: "bg-red-600 text-white border-red-600",     icon: <XCircle className="h-4 w-4" /> },
  { status: "PERMISO",  label: "Permiso",  active: "bg-amber-500 text-white border-amber-500", icon: <Clock className="h-4 w-4" /> },
  { status: "VACACION", label: "Vacación", active: "bg-blue-600 text-white border-blue-600",   icon: <Clock className="h-4 w-4" /> },
]

export default function AsistenciaPage() {
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  const [trabajadores, setTrabajadores] = React.useState<Trabajador[]>(TRABAJADORES_INIT)
  const [offline, setOffline] = React.useState(false)
  const [cola, setCola] = React.useState<object[]>([])

  const setEstado = (id: string, estado: AttendanceStatus) => {
    setTrabajadores(prev => prev.map(t => t.id === id ? { ...t, estado } : t))
  }

  const handleEnviar = () => {
    const payload = { fecha: new Date().toLocaleDateString("es-BO"), asistencias: trabajadores.map(t => ({ id: t.id, nombre: t.nombre, estado: t.estado })) }
    if (offline) {
      const nuevaCola = [...cola, payload]
      setCola(nuevaCola)
      try { localStorage.setItem("asistencias_offline", JSON.stringify(nuevaCola)) } catch (_) {}
      toast.warning("Sin conexión. Reporte encolado localmente.", { description: `${nuevaCola.length} reporte(s) en cola.` })
    } else {
      toast.success("Asistencia registrada y sincronizada", { description: `${trabajadores.filter(t => t.estado === "PRESENTE").length} presentes de ${trabajadores.length}` })
    }
  }

  const handleToggleOffline = (val: boolean) => {
    setOffline(val)
    if (!val && cola.length > 0) {
      toast.success(`Conexión recuperada. Sincronizando ${cola.length} reportes...`, { description: "Los registros locales serán enviados al servidor." })
      setCola([])
      try { localStorage.removeItem("asistencias_offline") } catch (_) {}
    }
  }

  const presentesCount = trabajadores.filter(t => t.estado === "PRESENTE").length

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      {isUseMocks && (
        <div className="bg-amber-500 text-amber-950 text-center text-xs font-bold py-2 px-4">
          MODO DEMO — Sincronización Diferida Simulada
        </div>
      )}

      {/* Header */}
      <div className="bg-emerald-700 px-5 pt-8 pb-6">
        <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest mb-2">Registro de Asistencia · CU#37</p>
        <h1 className="text-xl font-extrabold">Personal de Campo</h1>
        <p className="text-sm text-emerald-200 mt-1">
          <span className="text-white font-extrabold text-lg">{presentesCount}</span> /{trabajadores.length} presentes hoy
        </p>
      </div>

      {/* Offline toggle */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${offline ? "bg-red-900/40 border-red-800" : "bg-slate-800 border-slate-700"}`}>
        <div className="flex items-center gap-2">
          {offline ? <WifiOff className="h-4 w-4 text-red-400" /> : <Wifi className="h-4 w-4 text-emerald-400" />}
          <span className="text-sm font-bold">{offline ? "Modo Offline activo" : "Conexión activa"}</span>
          {cola.length > 0 && <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{cola.length} en cola</span>}
        </div>
        <button onClick={() => handleToggleOffline(!offline)}
          className={`relative h-6 w-11 rounded-full transition-colors ${offline ? "bg-red-500" : "bg-emerald-500"}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${offline ? "left-1" : "left-6"}`} />
        </button>
      </div>

      {/* Lista de trabajadores */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {trabajadores.map(t => (
          <div key={t.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-sm font-extrabold text-slate-300">
                {t.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{t.nombre}</p>
                <p className="text-[11px] text-slate-400">{t.rol}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {STATUS_BTN.map(s => (
                <button key={s.status} onClick={() => setEstado(t.id, s.status)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-bold transition-all active:scale-95 ${t.estado === s.status ? s.active : "bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700"}`}>
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Send button */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <button onClick={handleEnviar}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-extrabold active:scale-[0.98] transition-transform ${offline ? "bg-amber-500 text-amber-950" : "bg-emerald-600 text-white"}`}>
          <Send className="h-5 w-5" />
          {offline ? "Guardar Localmente (Offline)" : "Enviar Asistencia"}
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="bg-slate-800 border-t border-slate-700 flex items-center justify-around px-4 py-3">
        <Link href="/obra-mobile" className="flex flex-col items-center gap-1 text-slate-500">
          <HardHat className="h-5 w-5" /><span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link href="/obra-mobile/asistencia" className="flex flex-col items-center gap-1 text-emerald-400">
          <ClipboardCheck className="h-5 w-5" /><span className="text-[9px] font-bold">Asistencia</span>
        </Link>
        <Link href="/obra-mobile/avance" className="flex flex-col items-center gap-1 text-slate-500">
          <BarChart2 className="h-5 w-5" /><span className="text-[9px] font-bold">Avance</span>
        </Link>
      </nav>
    </div>
  )
}
