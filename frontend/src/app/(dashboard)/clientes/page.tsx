"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Users, Plus, RefreshCw, Loader2, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { clientsApi } from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";
import type { Client, ClientStatus } from "@/lib/api/types";

const CLIENT_STATUSES: ClientStatus[] = [
  "LEAD",
  "PROSPECTO",
  "RESERVADO",
  "FIRMADO",
  "ENTREGADO",
  "CERRADO",
];

const statusColor: Record<ClientStatus, string> = {
  LEAD: "bg-slate-100 text-slate-700",
  PROSPECTO: "bg-blue-100 text-blue-700",
  RESERVADO: "bg-amber-100 text-amber-700",
  FIRMADO: "bg-indigo-100 text-indigo-700",
  ENTREGADO: "bg-emerald-100 text-emerald-700",
  CERRADO: "bg-zinc-100 text-zinc-600",
};

const createSchema = z.object({
  ci: z.string().min(5, "CI mínimo 5 caracteres").regex(/^[0-9A-Za-z\-]+$/, "Solo letras, números o guión"),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(7, "Teléfono mínimo 7"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  source: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

const updateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().optional(),
  status: z.enum(CLIENT_STATUSES as [string, ...string[]]),
});
type UpdateForm = z.infer<typeof updateSchema>;

export default function ClientesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = React.useState<ClientStatus | "ALL">("ALL");
  const [q, setQ] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | null>(null);

  const clientsQ = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });

  const createMut = useMutation({
    mutationFn: (dto: CreateForm) =>
      clientsApi.create({
        ci: dto.ci,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email || undefined,
        source: dto.source || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dash", "clients"] });
      toast.success("Cliente creado");
      setCreateOpen(false);
    },
    onError: (e) => toast.error("Error al crear", { description: extractApiError(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateForm }) =>
      clientsApi.update(id, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email || undefined,
        source: dto.source || undefined,
        status: dto.status as ClientStatus,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dash", "clients"] });
      toast.success("Cliente actualizado");
      setEditing(null);
    },
    onError: (e) => toast.error("Error al actualizar", { description: extractApiError(e) }),
  });

  const items: Client[] = clientsQ.data ?? [];
  const filtered = items
    .filter((c) => filter === "ALL" || c.status === filter)
    .filter((c) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        c.ci.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        (c.email?.toLowerCase().includes(s) ?? false)
      );
    });

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-5 p-6 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              § Clientes · {items.length} en cartera
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
              <Users className="h-7 w-7 text-amber-600" />
              Gestión de clientes
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Pipeline LEAD → CERRADO con state machine validada por backend.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => clientsQ.refetch()} disabled={clientsQ.isFetching}>
              <RefreshCw className={clientsQ.isFetching ? "animate-spin" : ""} />
              Recargar
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              Nuevo cliente
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar nombre, CI, teléfono…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["ALL", ...CLIENT_STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  filter === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {s === "ALL" ? `Todos · ${items.length}` : `${s} · ${items.filter((c) => c.status === s).length}`}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {clientsQ.isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">Sin resultados.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CI</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.ci}</TableCell>
                    <TableCell className="text-sm font-semibold text-slate-900">{c.firstName} {c.lastName}</TableCell>
                    <TableCell className="font-mono text-xs">{c.phone}</TableCell>
                    <TableCell className="text-xs text-slate-600">{c.email ?? "—"}</TableCell>
                    <TableCell className="text-xs text-slate-500">{c.source ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${statusColor[c.status]}`}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <CreateClientDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={(d) => createMut.mutate(d)} isLoading={createMut.isPending} />
      <EditClientDialog client={editing} onClose={() => setEditing(null)} onSubmit={(d) => editing && updateMut.mutate({ id: editing.id, dto: d })} isLoading={updateMut.isPending} />
    </div>
  );
}

function CreateClientDialog({
  open, onOpenChange, onSubmit, isLoading,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (d: CreateForm) => void; isLoading: boolean;
}) {
  const form = useForm<CreateForm>({ resolver: zodResolver(createSchema), defaultValues: { ci: "", firstName: "", lastName: "", phone: "", email: "", source: "" } });
  React.useEffect(() => { if (open) form.reset({ ci: "", firstName: "", lastName: "", phone: "", email: "", source: "" }); }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Se creará en estado LEAD.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CI / NIT</Label>
              <Input placeholder="7891234" {...form.register("ci")} />
              {form.formState.errors.ci && <p className="mt-1 text-xs text-destructive">{form.formState.errors.ci.message}</p>}
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input placeholder="70012345" {...form.register("phone")} />
              {form.formState.errors.phone && <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nombres</Label>
              <Input {...form.register("firstName")} />
              {form.formState.errors.firstName && <p className="mt-1 text-xs text-destructive">{form.formState.errors.firstName.message}</p>}
            </div>
            <div>
              <Label>Apellidos</Label>
              <Input {...form.register("lastName")} />
              {form.formState.errors.lastName && <p className="mt-1 text-xs text-destructive">{form.formState.errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <Label>Email (opcional)</Label>
            <Input type="email" {...form.register("email")} />
            {form.formState.errors.email && <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <Label>Origen / fuente (opcional)</Label>
            <Input placeholder="Facebook, referido…" {...form.register("source")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin" />}Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditClientDialog({
  client, onClose, onSubmit, isLoading,
}: {
  client: Client | null; onClose: () => void; onSubmit: (d: UpdateForm) => void; isLoading: boolean;
}) {
  const form = useForm<UpdateForm>({ resolver: zodResolver(updateSchema), defaultValues: { firstName: "", lastName: "", phone: "", email: "", source: "", status: "LEAD" } });
  React.useEffect(() => {
    if (client) form.reset({
      firstName: client.firstName, lastName: client.lastName, phone: client.phone,
      email: client.email ?? "", source: client.source ?? "", status: client.status,
    });
  }, [client, form]);

  return (
    <Dialog open={!!client} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription className="font-mono text-xs">{client?.ci}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nombres</Label><Input {...form.register("firstName")} /></div>
            <div><Label>Apellidos</Label><Input {...form.register("lastName")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Teléfono</Label><Input {...form.register("phone")} /></div>
            <div><Label>Email</Label><Input type="email" {...form.register("email")} /></div>
          </div>
          <div><Label>Origen</Label><Input {...form.register("source")} /></div>
          <div>
            <Label>Estado</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}>
              {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Backend valida transiciones permitidas
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin" />}Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
