"use client"

import * as React from "react"
import { toast } from "sonner"
import { Users, Shield, CheckCircle2, XCircle, Edit2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BannerDemo } from "@/components/banner-demo"
import { useAuthSession } from "@/providers/auth-session-provider"
import { PERMISSIONS, ROLE_PERMISSIONS, type PermissionCode, type MockRoleCode } from "@/constants/permissions"

interface MockUser {
  id: string
  email: string
  fullName: string
  role: MockRoleCode
  activo: boolean
  permissions: PermissionCode[]
}

const INITIAL_USERS: MockUser[] = [
  { id: "usr-001", email: "admin@investco.com", fullName: "Administrador Investco", role: "ADMIN", activo: true, permissions: Object.values(PERMISSIONS) as PermissionCode[] },
  { id: "usr-002", email: "ventas@investco.com", fullName: "Vendedor Comercial", role: "VENDEDOR", activo: true, permissions: ROLE_PERMISSIONS["VENDEDOR"] },
  { id: "usr-003", email: "proyecto@investco.com", fullName: "Encargado de Proyecto", role: "ENCARG_PROYECTO", activo: true, permissions: ROLE_PERMISSIONS["ENCARG_PROYECTO"] },
  { id: "usr-004", email: "gerente@investco.com", fullName: "Gerente General", role: "ADMIN", activo: false, permissions: Object.values(PERMISSIONS) as PermissionCode[] },
]

const ALL_PERMISSIONS_LIST = Object.entries(PERMISSIONS) as [string, PermissionCode][]

export default function UsuariosPage() {
  const { session } = useAuthSession()
  const isUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  const canManage = session?.permissions.includes(PERMISSIONS.USERS_MANAGE) ?? false

  const [users, setUsers] = React.useState<MockUser[]>(INITIAL_USERS)
  const [editUser, setEditUser] = React.useState<MockUser | null>(null)
  const [draftPerms, setDraftPerms] = React.useState<PermissionCode[]>([])

  const openEdit = (u: MockUser) => {
    setEditUser(u)
    setDraftPerms([...u.permissions])
  }

  const togglePerm = (p: PermissionCode) => {
    setDraftPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const handleSave = () => {
    if (!editUser) return
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, permissions: draftPerms } : u))
    toast.success("Permisos actualizados", { description: `Usuario: ${editUser.fullName}` })
    setEditUser(null)
  }

  const toggleActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u))
    const target = users.find(u => u.id === id)
    toast.info(target?.activo ? "Cuenta desactivada" : "Cuenta reactivada")
  }

  const ROLE_COLORS: Record<MockRoleCode, string> = {
    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
    VENDEDOR: "bg-blue-50 text-blue-700 border-blue-200",
    ENCARG_PROYECTO: "bg-amber-50 text-amber-700 border-amber-200",
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {isUseMocks && <BannerDemo />}
      <div className="p-4 md:p-6 mx-auto max-w-7xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
              <p className="text-sm text-slate-500 mt-0.5">Administración de accesos y permisos RBAC (CU#31).</p>
            </div>
          </div>
          {!canManage && (
            <Badge className="bg-red-50 text-red-700 border-red-200">Sin permiso users:manage</Badge>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Usuario</th>
                  <th className="px-5 py-4">Rol</th>
                  <th className="px-5 py-4">Permisos</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className={`transition-colors hover:bg-slate-50/50 ${!u.activo ? "opacity-50" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={`text-[9px] font-bold uppercase ${ROLE_COLORS[u.role]}`}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {u.permissions.slice(0, 4).map(p => (
                          <span key={p} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{p}</span>
                        ))}
                        {u.permissions.length > 4 && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">+{u.permissions.length - 4} más</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${u.activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {u.activo ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {u.activo ? "Activo" : "Inactivo"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => openEdit(u)}>
                              <Edit2 className="h-3 w-3 mr-1" /> Permisos
                            </Button>
                            <Button size="sm" variant="outline" className={`h-7 text-[10px] ${u.activo ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`} onClick={() => toggleActive(u.id)}>
                              {u.activo ? "Desactivar" : "Reactivar"}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!editUser} onOpenChange={v => !v && setEditUser(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" /> Editar Permisos — {editUser?.fullName}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-2">
            {ALL_PERMISSIONS_LIST.map(([key, val]) => (
              <label key={val} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${draftPerms.includes(val) ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
                <input type="checkbox" checked={draftPerms.includes(val)} onChange={() => togglePerm(val)} className="accent-indigo-600 h-3.5 w-3.5" />
                <span className="text-[10px] font-mono text-slate-700 leading-tight">{val}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Save className="h-3.5 w-3.5 mr-1.5" /> Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
