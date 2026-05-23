import { create } from "zustand"
import { persist } from "zustand/middleware"

export type InmuebleStatus = "DISPONIBLE" | "RESERVADO" | "VENDIDO"
export type ClienteStatus = "LEAD" | "PROSPECTO" | "RESERVADO" | "FIRMADO"
export type ContratoStatus = "REVISION" | "FIRMADO" | "ANULADO"
export type TipoInmueble = "Lote" | "Casa" | "Dúplex"

export interface Inmueble {
  id: string
  codigo: string
  nombre: string
  proyecto: string
  tipo: TipoInmueble
  ubicacion: string
  precio: string // Guardado como string
  estado: InmuebleStatus
  superficie: number // Guardado como number (m2)
}

export interface Cliente {
  id: string
  documento: string
  nombre: string
  email: string
  telefono: string
  interes: string
  fuente: "Redes" | "Referido" | "Web" | "Walk-in"
  estado: ClienteStatus
  fechaRegistro: string
}

export interface Contrato {
  id: string
  codigo: string
  clienteId: string
  inmuebleId: string
  montoTotal: string
  fechaEntrega: string
  estado: ContratoStatus
  clausulas: Record<string, string>
}

export interface Reserva {
  id: string
  clienteId: string
  inmuebleId: string
  montoDeposito: string
  fecha: string
}

interface CommercialState {
  inmuebles: Inmueble[]
  clientes: Cliente[]
  contratos: Contrato[]
  reservas: Reserva[]
  
  // Acciones Inmuebles
  dividirLote: (idPadre: string, m2Hijo1: number, m2Hijo2: number) => void
  updateInmuebleStatus: (id: string, estado: InmuebleStatus) => void
  
  // Acciones Clientes
  addCliente: (cliente: Omit<Cliente, "id" | "estado" | "fechaRegistro">) => void
  updateClienteStatus: (id: string, estado: ClienteStatus) => void
  
  // Acciones Reservas
  addReserva: (reserva: Omit<Reserva, "id" | "fecha">) => void
  
  // Acciones Contratos
  firmarContrato: (contratoId: string) => void
}

const INITIAL_INMUEBLES: Inmueble[] = [
  { id: "INM-001", codigo: "L12-URB", nombre: "Lote Premium Urubó", proyecto: "Urbanización Urubó", tipo: "Lote", ubicacion: "Urubó", precio: "145000.00", estado: "DISPONIBLE", superficie: 450 },
  { id: "INM-002", codigo: "C05-PAL", nombre: "Casa Familiar Las Palmeras", proyecto: "Las Palmeras", tipo: "Casa", ubicacion: "Zona Norte", precio: "285000.00", estado: "DISPONIBLE", superficie: 320 },
  { id: "INM-003", codigo: "D02-VAN", nombre: "Dúplex Vanguardia", proyecto: "Edificio Tech Loft", tipo: "Dúplex", ubicacion: "Equipetrol", precio: "198000.00", estado: "RESERVADO", superficie: 185 },
  { id: "INM-004", codigo: "L08-CAM", nombre: "Lote Campestre", proyecto: "Hacienda del Sol", tipo: "Lote", ubicacion: "Cotoca", precio: "42000.00", estado: "VENDIDO", superficie: 600 },
  { id: "INM-005", codigo: "C10-MIN", nombre: "Casa Minimalista Urubó", proyecto: "Urubó Country", tipo: "Casa", ubicacion: "Urubó", precio: "360000.00", estado: "DISPONIBLE", superficie: 380 },
]

const INITIAL_CLIENTES: Cliente[] = [
  { id: "CLI-001", documento: "8930412 SC", nombre: "Alejandro Siles Gutiérrez", email: "a.siles@gmail.com", telefono: "780-12345", interes: "Lotes en Urubó", fuente: "Redes", estado: "PROSPECTO", fechaRegistro: "2026-03-10" },
  { id: "CLI-002", documento: "4920183 LP", nombre: "María René Torrico", email: "m.torrico@outlook.com", telefono: "677-43210", interes: "Casas Zona Norte", fuente: "Referido", estado: "RESERVADO", fechaRegistro: "2026-04-02" },
  { id: "CLI-003", documento: "3892014 SC", nombre: "Fernando Chaves", email: "f.chaves@investbol.com", telefono: "721-99887", interes: "Dúplex Equipetrol", fuente: "Web", estado: "FIRMADO", fechaRegistro: "2026-04-18" },
]

const INITIAL_CONTRATOS: Contrato[] = [
  {
    id: "CON-001",
    codigo: "CON-7729-2026",
    clienteId: "CLI-001",
    inmuebleId: "INM-001",
    montoTotal: "145000.00",
    fechaEntrega: "2026-12-15",
    estado: "REVISION",
    clausulas: {
      "Penalidad por Mora": "1% mensual sobre saldo.",
      "Entrega Física": "Sujeta al pago del 100% de la cuota inicial.",
    },
  },
]

export const useCommercialStore = create<CommercialState>()(
  persist(
    (set) => ({
      inmuebles: INITIAL_INMUEBLES,
      clientes: INITIAL_CLIENTES,
      contratos: INITIAL_CONTRATOS,
      reservas: [],

      dividirLote: (idPadre, m2Hijo1, m2Hijo2) =>
        set((state) => {
          const padre = state.inmuebles.find(i => i.id === idPadre)
          if (!padre || padre.tipo !== "Lote" || (m2Hijo1 + m2Hijo2 > padre.superficie)) return state

          const hijo1: Inmueble = { ...padre, id: `INM-${Date.now()}-1`, codigo: `${padre.codigo}-A`, nombre: `${padre.nombre} (Div. A)`, superficie: m2Hijo1 }
          const hijo2: Inmueble = { ...padre, id: `INM-${Date.now()}-2`, codigo: `${padre.codigo}-B`, nombre: `${padre.nombre} (Div. B)`, superficie: m2Hijo2 }

          return {
            inmuebles: [...state.inmuebles.filter(i => i.id !== idPadre), hijo1, hijo2],
          }
        }),

      updateInmuebleStatus: (id, estado) =>
        set((state) => ({
          inmuebles: state.inmuebles.map(i => i.id === id ? { ...i, estado } : i)
        })),

      addCliente: (c) =>
        set((state) => ({
          clientes: [
            {
              ...c,
              id: `CLI-${Date.now()}`,
              estado: "LEAD",
              fechaRegistro: new Date().toISOString(),
            },
            ...state.clientes,
          ],
        })),

      updateClienteStatus: (id, estado) =>
        set((state) => ({
          clientes: state.clientes.map(c => c.id === id ? { ...c, estado } : c)
        })),

      addReserva: (r) =>
        set((state) => {
          // Cascada: Inmueble -> RESERVADO, Cliente -> RESERVADO
          const nextInmuebles = state.inmuebles.map(i => i.id === r.inmuebleId ? { ...i, estado: "RESERVADO" as const } : i)
          const nextClientes = state.clientes.map(c => c.id === r.clienteId ? { ...c, estado: "RESERVADO" as const } : c)
          
          return {
            reservas: [...state.reservas, { ...r, id: `RES-${Date.now()}`, fecha: new Date().toISOString() }],
            inmuebles: nextInmuebles,
            clientes: nextClientes,
          }
        }),

      firmarContrato: (contratoId) =>
        set((state) => {
          const contrato = state.contratos.find(c => c.id === contratoId)
          if (!contrato) return state

          // Cascada: Contrato -> FIRMADO, Inmueble -> VENDIDO, Cliente -> FIRMADO
          const nextContratos = state.contratos.map(c => c.id === contratoId ? { ...c, estado: "FIRMADO" as const } : c)
          const nextInmuebles = state.inmuebles.map(i => i.id === contrato.inmuebleId ? { ...i, estado: "VENDIDO" as const } : i)
          const nextClientes = state.clientes.map(c => c.id === contrato.clienteId ? { ...c, estado: "FIRMADO" as const } : c)

          return {
            contratos: nextContratos,
            inmuebles: nextInmuebles,
            clientes: nextClientes,
          }
        }),
    }),
    {
      name: "commercial-storage",
    }
  )
)
