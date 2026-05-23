"use client"

import * as React from "react"
import { z } from "zod"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  Search,
  UserPlus,
  User,
  Mail,
  Phone,
  CreditCard,
  Building,
  Calendar,
  CalendarPlus,
} from "lucide-react"

import { useCommercialStore, Cliente } from "@/store/commercial-store"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"

// Esquema Zod para validación de Nuevo Cliente
const clienteSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  documento: z.string().min(5, "El documento es requerido"),
  email: z.string().email("Correo electrónico inválido").or(z.literal("")),
  telefono: z.string().optional(),
  interes: z.string().optional(),
})

export default function ClientesPage() {
  const { session } = useAuthSession()
  const hasWritePermission = session?.permissions.includes(PERMISSIONS.CLIENTS_WRITE)

  const { clientes, addCliente, updateClienteStatus } = useCommercialStore()
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [open, setOpen] = React.useState(false)

  // Estado del Formulario
  const [nombreForm, setNombreForm] = React.useState("")
  const [documentoForm, setDocumentoForm] = React.useState("")
  const [emailForm, setEmailForm] = React.useState("")
  const [telefonoForm, setTelefonoForm] = React.useState("")
  const [interesForm, setInteresForm] = React.useState("")
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Estado Modal Agenda
  const [agendaOpen, setAgendaOpen] = React.useState(false)
  const [clienteAgenda, setClienteAgenda] = React.useState<Cliente | null>(null)
  const [fechaAgenda, setFechaAgenda] = React.useState("")
  const [notasAgenda, setNotasAgenda] = React.useState("")
  const [agendaError, setAgendaError] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    const data = {
      nombre: nombreForm,
      documento: documentoForm,
      email: emailForm,
      telefono: telefonoForm,
      interes: interesForm,
    }

    const parsed = clienteSchema.safeParse(data)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      })
      setFormErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)

    // Simular carga de red
    setTimeout(() => {
      addCliente({
        ...parsed.data,
        email: parsed.data.email || "sin-correo@investco.com",
        telefono: parsed.data.telefono || "S/T",
        interes: parsed.data.interes || "General",
        fuente: "Web",
      })

      toast.success("Cliente registrado con éxito en estado LEAD")
      
      setNombreForm("")
      setDocumentoForm("")
      setEmailForm("")
      setTelefonoForm("")
      setInteresForm("")
      setOpen(false)
      setIsSubmitting(false)
    }, 1000)
  }

  const handleOpenAgenda = (cliente: Cliente) => {
    setClienteAgenda(cliente)
    setFechaAgenda("")
    setNotasAgenda("")
    setAgendaError("")
    setAgendaOpen(true)
  }

  const submitAgenda = (e: React.FormEvent) => {
    e.preventDefault()
    setAgendaError("")

    if (!fechaAgenda) {
      setAgendaError("La fecha es requerida.")
      return
    }

    const inputDate = new Date(fechaAgenda)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Compare solo fechas sin horas

    if (inputDate < today) {
      setAgendaError("La fecha no puede ser en el pasado.")
      return
    }

    if (!clienteAgenda) return

    updateClienteStatus(clienteAgenda.id, "PROSPECTO")
    toast.success("Reunión agendada", { description: `El cliente ${clienteAgenda.nombre} ahora es PROSPECTO.` })
    setAgendaOpen(false)
  }

  // Columnas
  const columns = React.useMemo<ColumnDef<Cliente>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre Completo",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 text-sm md:text-base">
                {row.getValue("nombre")}
              </span>
              <span className="text-xs text-slate-500">CI: {row.original.documento}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "contacto",
        header: "Contacto",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
              {row.original.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
              {row.original.telefono}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "fuente",
        header: "Fuente",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-slate-700 font-medium text-sm">
            <span>{row.getValue("fuente")}</span>
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.getValue("estado") as string
          let statusStyle = ""
          
          if (estado === "LEAD") statusStyle = "bg-slate-100 text-slate-600 border-slate-200"
          else if (estado === "PROSPECTO") statusStyle = "bg-blue-50 text-blue-700 border-blue-200"
          else if (estado === "RESERVADO") statusStyle = "bg-amber-50 text-amber-700 border-amber-200"
          else if (estado === "FIRMADO") statusStyle = "bg-emerald-50 text-emerald-700 border-emerald-200"

          return (
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${statusStyle}`}>
              {estado}
            </span>
          )
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const c = row.original
          // Acción Agendar Reunión (solo LEAD) y con permiso
          if (hasWritePermission && c.estado === "LEAD") {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenAgenda(c)
                }}
                className="text-xs h-8 px-2"
              >
                <CalendarPlus className="h-3.5 w-3.5 mr-1 text-blue-500" />
                Agendar Reunión
              </Button>
            )
          }
          return null
        }
      }
    ],
    [hasWritePermission]
  )

  const table = useReactTable({
    data: clientes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Directorio de Clientes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Visualización, búsqueda y registro de clientes interesados o compradores de proyectos INVESTCO.
            </p>
          </div>

          {/* Modal Registro Cliente */}
          {hasWritePermission && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer">
                  <UserPlus className="h-4.5 w-4.5" />
                  Registrar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                    Nuevo Cliente
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 mt-1">
                    Ingrese los datos para dar de alta un nuevo prospecto o cliente en el sistema.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4.5 py-3">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nombre"
                      placeholder="Ej. Juan Pérez Roca"
                      value={nombreForm}
                      onChange={(e) => setNombreForm(e.target.value)}
                      className={formErrors.nombre ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {formErrors.nombre && <p className="text-red-500 text-xs font-medium">{formErrors.nombre}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Documento (CI/NIT) *
                    </Label>
                    <Input
                      id="documento"
                      placeholder="Ej. 1029384 SC"
                      value={documentoForm}
                      onChange={(e) => setDocumentoForm(e.target.value)}
                      className={formErrors.documento ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {formErrors.documento && <p className="text-red-500 text-xs font-medium">{formErrors.documento}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Correo Electrónico
                      </Label>
                      <Input
                        id="email"
                        placeholder="correo@ejemplo.com"
                        value={emailForm}
                        onChange={(e) => setEmailForm(e.target.value)}
                        className={formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {formErrors.email && <p className="text-red-500 text-xs font-medium">{formErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        placeholder="Ej. 770-12345"
                        value={telefonoForm}
                        onChange={(e) => setTelefonoForm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inmueble / Proyecto de Interés
                    </Label>
                    <Input
                      id="interes"
                      placeholder="Ej. Casa Minimalista Urubó"
                      value={interesForm}
                      onChange={(e) => setInteresForm(e.target.value)}
                    />
                  </div>

                  <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cliente"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Panel de Filtros y Búsqueda */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por cliente, documento, correo o inmueble de interés..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border-slate-200 hover:border-slate-300 focus:border-indigo-500 transition-colors bg-slate-50/50 focus:bg-white rounded-lg placeholder-slate-400"
            />
          </div>
        </div>

        {/* Contenedor de la Tabla */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg">
          <Table>
            <TableHeader className="bg-slate-50/85 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4 px-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-indigo-50/20 border-b border-slate-100 transition-colors group cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4.5 px-6 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-slate-400"
                  >
                    No se encontraron clientes que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal Agendar Reunión */}
        <Dialog open={agendaOpen} onOpenChange={setAgendaOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Reunión</DialogTitle>
              <DialogDescription>
                Programe una reunión con {clienteAgenda?.nombre}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitAgenda} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="fechaAgenda">Fecha de Reunión *</Label>
                <Input
                  id="fechaAgenda"
                  type="date"
                  value={fechaAgenda}
                  onChange={e => setFechaAgenda(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notasAgenda">Notas / Temas a tratar</Label>
                <Input
                  id="notasAgenda"
                  value={notasAgenda}
                  onChange={e => setNotasAgenda(e.target.value)}
                  placeholder="Ej. Revisar cotización Lote 12"
                />
              </div>
              
              {agendaError && (
                <div className="text-red-500 text-sm font-semibold bg-red-50 p-2 rounded">
                  {agendaError}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setAgendaOpen(false)}>Cancelar</Button>
                <Button type="submit">Agendar y Avanzar a PROSPECTO</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
