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
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Search,
  Home,
  Building2,
  MapPin,
  Layers,
  DollarSign,
  Maximize2,
  Building,
  SplitSquareHorizontal,
} from "lucide-react"

import { useCommercialStore, Inmueble } from "@/store/commercial-store"
import { formatMoney } from "@/lib/money"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS } from "@/constants/permissions"

const divideLoteSchema = z.object({
  m2Hijo1: z.number().min(1, "El área debe ser mayor a 0"),
  m2Hijo2: z.number().min(1, "El área debe ser mayor a 0"),
})

export default function InmueblesPage() {
  const { session } = useAuthSession()
  const hasWritePermission = session?.permissions.includes(PERMISSIONS.PROPERTIES_WRITE)

  const { inmuebles, dividirLote } = useCommercialStore()
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Estado Dialog Dividir Lote
  const [dividirOpen, setDividirOpen] = React.useState(false)
  const [loteSelected, setLoteSelected] = React.useState<Inmueble | null>(null)
  
  const [m2Hijo1Str, setM2Hijo1Str] = React.useState("")
  const [m2Hijo2Str, setM2Hijo2Str] = React.useState("")
  const [dividirError, setDividirError] = React.useState("")

  const handleOpenDividir = (inmueble: Inmueble) => {
    setLoteSelected(inmueble)
    setM2Hijo1Str("")
    setM2Hijo2Str("")
    setDividirError("")
    setDividirOpen(true)
  }

  const submitDividir = (e: React.FormEvent) => {
    e.preventDefault()
    setDividirError("")
    
    const h1 = parseFloat(m2Hijo1Str)
    const h2 = parseFloat(m2Hijo2Str)

    const parsed = divideLoteSchema.safeParse({ m2Hijo1: h1, m2Hijo2: h2 })
    if (!parsed.success) {
      setDividirError("Los valores ingresados no son válidos.")
      return
    }

    if (!loteSelected) return
    
    if (h1 + h2 > loteSelected.superficie) {
      setDividirError(`La suma de las áreas (${h1 + h2} m²) no puede ser mayor al lote original (${loteSelected.superficie} m²).`)
      return
    }

    dividirLote(loteSelected.id, h1, h2)
    toast.success("Lote dividido con éxito", { description: "Se han generado dos nuevos lotes en el catálogo." })
    setDividirOpen(false)
  }

  // Definición de columnas
  const columns = React.useMemo<ColumnDef<Inmueble>[]>(
    () => [
      {
        accessorKey: "codigo",
        header: "Código",
        cell: ({ row }) => (
          <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60 font-semibold shadow-2xs">
            {row.getValue("codigo")}
          </span>
        ),
      },
      {
        accessorKey: "nombre",
        header: "Inmueble / Proyecto",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm md:text-base">
              {row.original.nombre}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Building className="h-3 w-3 text-slate-400" />
              {row.original.proyecto}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => {
          const tipo = row.getValue("tipo") as string
          return (
            <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
              {tipo === "Lote" && <Layers className="h-4 w-4 text-emerald-500" />}
              {tipo === "Casa" && <Home className="h-4 w-4 text-blue-500" />}
              {tipo === "Dúplex" && <Building2 className="h-4 w-4 text-purple-500" />}
              <span>{tipo}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "ubicacion",
        header: "Ubicación",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-slate-600 text-sm">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px]">{row.getValue("ubicacion")}</span>
          </div>
        ),
      },
      {
        accessorKey: "superficie",
        header: "Superficie",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-slate-600 text-sm">
            <Maximize2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{row.getValue("superficie")} m²</span>
          </div>
        ),
      },
      {
        accessorKey: "precio",
        header: "Precio Base",
        cell: ({ row }) => (
          <div className="flex items-center text-slate-900 font-semibold text-sm">
            <DollarSign className="h-3.5 w-3.5 text-slate-400 -mr-0.5" />
            <span>{formatMoney(row.getValue("precio"))}</span>
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.getValue("estado") as string
          let statusStyle = ""
          
          if (estado === "DISPONIBLE") {
            statusStyle = "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-emerald-100/50"
          } else if (estado === "RESERVADO") {
            statusStyle = "bg-amber-50 text-amber-700 border-amber-200/80 shadow-amber-100/50"
          } else {
            statusStyle = "bg-slate-100 text-slate-600 border-slate-200/80 shadow-slate-100/50"
          }

          return (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm ${statusStyle}`}>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                estado === "DISPONIBLE" ? "bg-emerald-500" : estado === "RESERVADO" ? "bg-amber-500" : "bg-slate-400"
              }`} />
              {estado}
            </span>
          )
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const i = row.original
          // Acción "Dividir Lote" solo visible para Lotes DISPONIBLES y si tiene permiso PROPERTIES_WRITE
          if (hasWritePermission && i.tipo === "Lote" && i.estado === "DISPONIBLE") {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenDividir(i)
                }}
                className="text-xs h-8 px-2"
              >
                <SplitSquareHorizontal className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                Dividir
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
    data: inmuebles,
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Catálogo de Inmuebles
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Administración y consulta del inventario de lotes, casas y dúplex de INVESTCO.
            </p>
          </div>
          
          {/* Métricas rápidas */}
          <div className="flex gap-4 items-center mt-3 sm:mt-0 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="text-center px-3 border-r border-slate-100">
              <span className="block text-xs font-medium text-slate-400 uppercase">Total</span>
              <span className="text-lg font-bold text-slate-800">{inmuebles.length}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-100">
              <span className="block text-xs font-medium text-emerald-500 uppercase">Disp.</span>
              <span className="text-lg font-bold text-emerald-600">
                {inmuebles.filter(i => i.estado === "DISPONIBLE").length}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xs font-medium text-amber-500 uppercase">Reser.</span>
              <span className="text-lg font-bold text-amber-600">
                {inmuebles.filter(i => i.estado === "RESERVADO").length}
              </span>
            </div>
          </div>
        </div>

        {/* Panel de Filtros y Búsqueda */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por inmueble, código o estado..."
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
                    No se encontraron inmuebles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog Dividir Lote */}
        <Dialog open={dividirOpen} onOpenChange={setDividirOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Dividir Lote</DialogTitle>
              <DialogDescription>
                Lote Padre: {loteSelected?.nombre} (Superficie: {loteSelected?.superficie} m²)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitDividir} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="m2Hijo1">m² Lote A *</Label>
                  <Input
                    id="m2Hijo1"
                    type="number"
                    value={m2Hijo1Str}
                    onChange={e => setM2Hijo1Str(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m2Hijo2">m² Lote B *</Label>
                  <Input
                    id="m2Hijo2"
                    type="number"
                    value={m2Hijo2Str}
                    onChange={e => setM2Hijo2Str(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {dividirError && (
                <div className="text-red-500 text-sm font-semibold bg-red-50 p-2 rounded">
                  {dividirError}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setDividirOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar División</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
