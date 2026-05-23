"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Camera, Send, BarChart2, ClipboardCheck, HardHat, WifiOff, Wifi, CheckCircle2 } from "lucide-react"

const ACTIVIDADES = [
  { id: "AB-01", nombre: "Excavación y Cimientos", etapa: "OBRA_BRUTA", progreso: 100 },
  { id: "AB-02", nombre: "Estructura de Hormigón y Muros", etapa: "OBRA_BRUTA", progreso: 50 },
  { id: "AB-03", nombre: "Techado y Cubierta", etapa: "OBRA_BRUTA", progreso: 0 },
  { id: "AF-01", nombre: "Instalaciones Hidrosanitarias", etapa: "OBRA_FINA", progreso: 0 },
  { id: "AF-02", nombre: "Acabados y Pintura", etapa: "OBRA_FINA", progreso: 0 },
]

export default function AvancePWAPage() {
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  const [actSelId, setActSelId] = React.useState(ACTIVIDADES[1].id)
  const [sliderVal, setSliderVal] = React.useState(50)
  const [foto, setFoto] = React.useState<string>("")
  const [offline, setOffline] = React.useState(false)
  const [cola, setCola] = React.useState<object[]>([])
  const [error, setError] = React.useState("")

  const actSel = ACTIVIDADES.find(a => a.id === actSelId)!

  // Sync slider with selected activity's current progress
  React.useEffect(() => {
    setSliderVal(actSel.progreso)
    setError("")
  }, [actSelId, actSel.progreso])

  const handleEnviar = () => {
    if (sliderVal < actSel.progreso) {
      setError(`No se admite regresión en el avance (actual: ${actSel.progreso}%)`)
      return
    }
    setError("")
    const payload = {
      actividadId: actSel.id,
      nombre: actSel.nombre,
      nuevoProgreso: sliderVal,
      foto: foto || null,
      fecha: new Date().toLocaleDateString("es-BO"),
      hora: new Date().toLocaleTimeString("es-BO"),
    }

    if (offline) {
      const nuevaCola = [...cola, payload]
      setCola(nuevaCola)
      try { localStorage.setItem("avance_offline", JSON.stringify(nuevaCola)) } catch (_) {}
      toast.warning("Sin conexión. Reporte encolado localmente.", { description: `${nuevaCola.length} reporte(s) en cola.` })
    } else {
      toast.success(`Avance enviado: ${actSel.nombre} → ${sliderVal}%`, { description: foto ? `Foto adjunta: ${foto}` : "Sin fotografía" })
    }
  }

  const handleToggleOffline = (val: boolean) => {
    setOffline(val)
    if (!val && cola.length > 0) {
      toast.success(`Conexión recuperada. Sincronizando ${cola.length} reportes...`)
      setCola([])
      try { localStorage.removeItem("avance_offline") } catch (_) {}
    }
  }

  const isTerminada = actSel.progreso === 100

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      {isUseMocks && (
        <div className="bg-amber-500 text-amber-950 text-center text-xs font-bold py-2 px-4">
          MODO DEMO — Sincronización Diferida Simulada
        </div>
      )}

      {/* Header */}
      <div className="bg-indigo-700 px-5 pt-8 pb-6">
        <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-2">Reporte de Avance · CU#19</p>
        <h1 className="text-xl font-extrabold">Actualizar Progreso</h1>
        <p className="text-sm text-indigo-200 mt-1">Torre Piraí — PRJ-PIRAI</p>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selector de actividad */}
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Selecciona la Actividad</p>
          <div className="space-y-2">
            {ACTIVIDADES.map(a => (
              <button key={a.id} onClick={() => { if (a.progreso < 100) setActSelId(a.id) }}
                disabled={a.progreso === 100}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                  a.id === actSelId ? "bg-indigo-600 border-indigo-500" :
                  a.progreso === 100 ? "bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed" :
                  "bg-slate-800 border-slate-700 hover:border-indigo-600"
                }`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{a.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${a.etapa === "OBRA_BRUTA" ? "bg-indigo-500/30 text-indigo-300" : "bg-amber-500/30 text-amber-300"}`}>
                      {a.etapa.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-400">{a.progreso}% actual</span>
                  </div>
                </div>
                {a.progreso === 100 && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Slider de avance */}
        {!isTerminada && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-300">Nuevo Porcentaje</p>
              <span className="text-3xl font-black text-indigo-400">{sliderVal}%</span>
            </div>
            <input
              type="range" min={actSel.progreso} max={100} step={1} value={sliderVal}
              onChange={e => { setSliderVal(parseInt(e.target.value)); setError("") }}
              className="w-full h-3 rounded-full appearance-none cursor-pointer accent-indigo-500 bg-slate-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
              <span>Mínimo: {actSel.progreso}%</span><span>Máximo: 100%</span>
            </div>
            {error && <p className="text-red-400 text-xs font-bold mt-2">{error}</p>}
          </div>
        )}

        {/* Foto */}
        {!isTerminada && (
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Fotografía de Evidencia</p>
            <label className="flex items-center gap-4 bg-slate-800 border-2 border-dashed border-slate-600 rounded-2xl p-5 cursor-pointer hover:border-indigo-500 transition-colors active:scale-[0.98]">
              <div className="h-12 w-12 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                <Camera className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{foto || "Adjuntar Foto de Obra"}</p>
                <p className="text-xs text-slate-400 mt-0.5">{foto ? "✓ Lista para enviar" : "Toca para capturar o seleccionar"}</p>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setFoto(f.name); toast.success("Foto adjuntada") }
                }} />
            </label>
          </div>
        )}
      </div>

      {/* Send */}
      {!isTerminada && (
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <button onClick={handleEnviar}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-extrabold active:scale-[0.98] transition-transform ${offline ? "bg-amber-500 text-amber-950" : "bg-indigo-600 text-white"}`}>
            <Send className="h-5 w-5" />
            {offline ? "Guardar Localmente (Offline)" : "Enviar Reporte de Avance"}
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="bg-slate-800 border-t border-slate-700 flex items-center justify-around px-4 py-3">
        <Link href="/obra-mobile" className="flex flex-col items-center gap-1 text-slate-500">
          <HardHat className="h-5 w-5" /><span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link href="/obra-mobile/asistencia" className="flex flex-col items-center gap-1 text-slate-500">
          <ClipboardCheck className="h-5 w-5" /><span className="text-[9px] font-bold">Asistencia</span>
        </Link>
        <Link href="/obra-mobile/avance" className="flex flex-col items-center gap-1 text-indigo-400">
          <BarChart2 className="h-5 w-5" /><span className="text-[9px] font-bold">Avance</span>
        </Link>
      </nav>
    </div>
  )
}
