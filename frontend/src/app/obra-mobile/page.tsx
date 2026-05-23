"use client"

import Link from "next/link"
import { ClipboardCheck, BarChart2, Wifi, WifiOff, HardHat } from "lucide-react"

export default function ObraMobileHome() {
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      {/* Demo Banner */}
      {isUseMocks && (
        <div className="bg-amber-500 text-amber-950 text-center text-xs font-bold py-2 px-4">
          MODO DEMO — Sincronización Diferida Simulada
        </div>
      )}

      {/* Header */}
      <div className="bg-indigo-700 px-6 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <HardHat className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-tight">INVESTCO Campo</h1>
            <p className="text-xs text-indigo-200">Torre Piraí — PRJ-PIRAI</p>
          </div>
        </div>
        <p className="text-sm text-indigo-200 mt-4">
          Encargado: <span className="text-white font-semibold">Ing. Roberto Méndez</span>
        </p>
        <p className="text-xs text-indigo-300 mt-0.5">23/05/2026 • Etapa: OBRA BRUTA</p>
      </div>

      {/* Main Actions */}
      <div className="flex-1 p-5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Acciones del Día</p>

        <Link href="/obra-mobile/asistencia"
          className="flex items-center gap-5 bg-slate-800 border border-slate-700 rounded-2xl p-5 active:scale-[0.98] transition-transform">
          <div className="h-14 w-14 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white">Registro de Asistencia</p>
            <p className="text-sm text-slate-400 mt-0.5">Marcar presencia del personal (CU#37)</p>
          </div>
          <span className="ml-auto text-slate-600 text-2xl">›</span>
        </Link>

        <Link href="/obra-mobile/avance"
          className="flex items-center gap-5 bg-slate-800 border border-slate-700 rounded-2xl p-5 active:scale-[0.98] transition-transform">
          <div className="h-14 w-14 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shrink-0">
            <BarChart2 className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white">Reporte de Avance</p>
            <p className="text-sm text-slate-400 mt-0.5">Actualizar progreso y adjuntar fotos (CU#19)</p>
          </div>
          <span className="ml-auto text-slate-600 text-2xl">›</span>
        </Link>

        {/* Status Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center gap-3">
          <Wifi className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-300">Estado de Sincronización</p>
            <p className="text-[10px] text-slate-500">Último sync: hace 2 minutos</p>
          </div>
          <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">En línea</span>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="bg-slate-800 border-t border-slate-700 flex items-center justify-around px-4 py-3 safe-bottom">
        <Link href="/obra-mobile" className="flex flex-col items-center gap-1 text-indigo-400">
          <HardHat className="h-5 w-5" />
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link href="/obra-mobile/asistencia" className="flex flex-col items-center gap-1 text-slate-500">
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-[9px] font-bold">Asistencia</span>
        </Link>
        <Link href="/obra-mobile/avance" className="flex flex-col items-center gap-1 text-slate-500">
          <BarChart2 className="h-5 w-5" />
          <span className="text-[9px] font-bold">Avance</span>
        </Link>
      </nav>
    </div>
  )
}
