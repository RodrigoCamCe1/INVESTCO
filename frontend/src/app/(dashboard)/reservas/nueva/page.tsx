"use client"

import * as React from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  User,
  Home,
  DollarSign,
  Check,
  Search,
  ChevronRight,
  ChevronLeft,
  Building,
  CheckCircle2,
  Building2,
  Layers,
  MapPin,
  CreditCard,
  Download,
} from "lucide-react"

import { useCommercialStore, Cliente, Inmueble } from "@/store/commercial-store"
import { formatMoney } from "@/lib/money"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"

export default function NuevaReservaPage() {
  const { session } = useAuthSession()
  const hasPermission = session?.permissions.includes(PERMISSIONS.RESERVATIONS_WRITE)

  const { clientes, inmuebles, addReserva } = useCommercialStore()

  // Stepper State
  const [step, setStep] = React.useState(1)
  
  // Selección
  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | null>(null)
  const [selectedInmueble, setSelectedInmueble] = React.useState<Inmueble | null>(null)
  
  // Paso 3 Form (Depósito)
  const [montoDeposito, setMontoDeposito] = React.useState("")
  const [metodoPago, setMetodoPago] = React.useState("Transferencia")
  const [validezDias, setValidezDias] = React.useState("15")
  const [condicionReembolso, setCondicionReembolso] = React.useState("No Reembolsable")

  // Estado del Check de Crédito
  const [creditStatus, setCreditStatus] = React.useState<"idle" | "loading" | "approved" | "rejected">("idle")
  
  // Búsquedas
  const [searchCliente, setSearchCliente] = React.useState("")
  const [searchInmueble, setSearchInmueble] = React.useState("")
  const [finished, setFinished] = React.useState(false)

  // Filtrados: Solo Clientes en estado PROSPECTO y Inmuebles DISPONIBLE
  const availableClientes = clientes.filter(c => c.estado === "PROSPECTO")
  const filteredClientes = availableClientes.filter(c =>
    c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.documento.toLowerCase().includes(searchCliente.toLowerCase())
  )

  const availableInmuebles = inmuebles.filter(i => i.estado === "DISPONIBLE")
  const filteredInmuebles = availableInmuebles.filter(i =>
    i.nombre.toLowerCase().includes(searchInmueble.toLowerCase()) ||
    i.codigo.toLowerCase().includes(searchInmueble.toLowerCase()) ||
    i.ubicacion.toLowerCase().includes(searchInmueble.toLowerCase())
  )

  const handleNext = () => {
    if (step === 1 && selectedCliente) {
      setStep(2)
    } else if (step === 2 && selectedInmueble) {
      setStep(3)
    } else if (step === 3 && creditStatus !== "loading") {
      setStep(4)
    } else if (step === 4) {
      if (!montoDeposito || parseFloat(montoDeposito) <= 0) {
        toast.error("Por favor ingrese un monto de depósito válido.")
        return
      }
      setStep(5)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const checkCredit = () => {
    if (!selectedInmueble) return
    setCreditStatus("loading")
    setTimeout(() => {
      const precioFloat = parseFloat(selectedInmueble.precio)
      if (precioFloat < 100000) {
        setCreditStatus("approved")
        toast.success("Capacidad crediticia pre-aprobada")
      } else {
        const isApproved = Math.random() > 0.5
        setCreditStatus(isApproved ? "approved" : "rejected")
        if (isApproved) toast.success("Capacidad crediticia pre-aprobada")
        else toast.error("La capacidad crediticia simulada ha sido rechazada.")
      }
    }, 2000)
  }

  const handleFinalize = () => {
    if (!selectedCliente || !selectedInmueble) return
    
    // Dispara la mutación reactiva
    addReserva({
      clienteId: selectedCliente.id,
      inmuebleId: selectedInmueble.id,
      montoDeposito,
    })

    toast.success("Reserva completada con éxito", {
      description: `Inmueble bloqueado para ${selectedCliente.nombre}.`,
    })
    setFinished(true)
  }

  const handleReset = () => {
    setSelectedCliente(null)
    setSelectedInmueble(null)
    setMontoDeposito("")
    setMetodoPago("Transferencia")
    setValidezDias("15")
    setCondicionReembolso("No Reembolsable")
    setSearchCliente("")
    setSearchInmueble("")
    setCreditStatus("idle")
    setStep(1)
    setFinished(false)
  }

  const handleDownloadPDF = () => {
    toast.info("Generando Constancia de Reserva...", { duration: 2000 })
    setTimeout(() => {
      toast.success("Descarga completada")
    }, 2000)
  }

  if (!hasPermission) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        No tienes permisos para crear reservas (RESERVATIONS_WRITE requerido).
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Encabezado */}
        <div className="pb-5 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Crear Nueva Reserva
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Asistente comercial para el registro y bloqueo temporal de inmuebles en catálogo.
          </p>
        </div>

        {finished ? (
          /* Pantalla de Éxito al finalizar */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6 shadow-lg animate-in fade-in zoom-in duration-300">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">¡Reserva Completada!</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                El inmueble ha sido bloqueado en el catálogo y el estado del cliente ha sido actualizado a RESERVADO.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button
                onClick={handleDownloadPDF}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-6 rounded-xl cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Constancia PDF
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="font-semibold py-2 px-6 rounded-xl cursor-pointer"
              >
                Crear Otra Reserva
              </Button>
            </div>
          </div>
        ) : (
          /* Stepper Activo */
          <div className="space-y-6">
            
            {/* Indicador Visual de Pasos (5 pasos) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mx-auto px-4 overflow-x-auto gap-4">
                {[
                  { n: 1, l: "Cliente" },
                  { n: 2, l: "Inmueble" },
                  { n: 3, l: "Crédito" },
                  { n: 4, l: "Depósito" },
                  { n: 5, l: "Confirmar" }
                ].map((s, i) => (
                  <React.Fragment key={s.n}>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                        step > s.n ? "bg-emerald-500 text-white" : step === s.n ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-slate-100 text-slate-500"
                      }`}>
                        {step > s.n ? <Check className="h-3.5 w-3.5" /> : s.n}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block ${step === s.n ? "text-indigo-600" : "text-slate-500"}`}>
                        {s.l}
                      </span>
                    </div>
                    {i < 4 && <div className="flex-1 h-0.5 bg-slate-200 min-w-[20px]" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Contenido del Paso */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[380px] flex flex-col justify-between shadow-xs">
              
              {/* Paso 1: Seleccionar Cliente */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-600" />
                      Seleccionar Prospecto
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      Solo se muestran clientes en estado PROSPECTO.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar prospecto..."
                      value={searchCliente}
                      onChange={(e) => setSearchCliente(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {filteredClientes.map((c) => {
                      const isSelected = selectedCliente?.id === c.id
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCliente(c)}
                          className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? "bg-indigo-50/50 hover:bg-indigo-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                            }`}>
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{c.nombre}</p>
                              <p className="text-xs text-slate-500">CI: {c.documento} • {c.email}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {filteredClientes.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No hay prospectos disponibles.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 2: Seleccionar Inmueble */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Home className="h-5 w-5 text-indigo-600" />
                      Seleccionar Inmueble Disponible
                    </h2>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar por inmueble..."
                      value={searchInmueble}
                      onChange={(e) => setSearchInmueble(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-56 overflow-y-auto pr-1">
                    {filteredInmuebles.map((i) => {
                      const isSelected = selectedInmueble?.id === i.id
                      return (
                        <div
                          key={i.id}
                          onClick={() => setSelectedInmueble(i)}
                          className={`p-3.5 border rounded-xl cursor-pointer flex flex-col justify-between transition-all ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-100"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{i.nombre}</p>
                              <span className="inline-flex items-center gap-1 mt-1 text-xs text-slate-500">
                                {i.tipo}
                              </span>
                            </div>
                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                              {i.codigo}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 border-t border-slate-100/60 pt-2">
                            <span className="text-sm font-bold text-slate-800">
                              {formatMoney(i.precio)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {filteredInmuebles.length === 0 && (
                      <div className="col-span-2 p-8 text-center text-slate-400 text-sm">
                        No se encontraron inmuebles disponibles.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 3: Capacidad Crediticia */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200 text-center py-6">
                  <CreditCard className="h-12 w-12 text-indigo-400 mx-auto" />
                  <h2 className="text-xl font-bold text-slate-900">Capacidad Crediticia (CU#32)</h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Verifique el perfil financiero del prospecto {selectedCliente?.nombre} para la compra de {selectedInmueble?.nombre}.
                  </p>

                  <div className="pt-4">
                    {creditStatus === "idle" && (
                      <Button onClick={checkCredit} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                        Verificar Crédito Bancario
                      </Button>
                    )}
                    {creditStatus === "loading" && (
                      <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
                        <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        Consultando Buró Crediticio...
                      </div>
                    )}
                    {creditStatus === "approved" && (
                      <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 inline-block font-semibold">
                        ✅ Crédito Pre-Aprobado
                      </div>
                    )}
                    {creditStatus === "rejected" && (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 inline-block font-semibold">
                        ❌ Capacidad Insuficiente
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 4: Condiciones de Depósito */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    Condiciones del Depósito
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monto de Depósito (USD) *</Label>
                      <Input
                        type="number"
                        required
                        value={montoDeposito}
                        onChange={(e) => setMontoDeposito(e.target.value)}
                        placeholder="Ej. 5000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none"
                      >
                        <option>Transferencia Bancaria</option>
                        <option>Efectivo</option>
                        <option>Cheque</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Días de Validez de Reserva</Label>
                      <Input
                        type="number"
                        value={validezDias}
                        onChange={(e) => setValidezDias(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Condiciones de Reembolso</Label>
                      <select
                        value={condicionReembolso}
                        onChange={(e) => setCondicionReembolso(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none"
                      >
                        <option>No Reembolsable</option>
                        <option>Reembolsable con Penalidad</option>
                        <option>100% Reembolsable</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 5: Confirmar */}
              {step === 5 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    Resumen Final
                  </h2>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Cliente:</span>
                      <span className="font-semibold text-slate-800">{selectedCliente?.nombre}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Inmueble:</span>
                      <span className="font-semibold text-slate-800">{selectedInmueble?.nombre}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Depósito Acordado:</span>
                      <span className="font-bold text-indigo-600 text-base">USD {montoDeposito}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Validez: {validezDias} días</span>
                      <span>Reembolso: {condicionReembolso}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones del Stepper */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-4">
                <Button
                  onClick={handleBack}
                  disabled={step === 1}
                  variant="outline"
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>

                {step < 5 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !selectedCliente) ||
                      (step === 2 && !selectedInmueble) ||
                      (step === 3 && creditStatus !== "approved")
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                  >
                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalize}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                  >
                    Confirmar Reserva <CheckCircle2 className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
