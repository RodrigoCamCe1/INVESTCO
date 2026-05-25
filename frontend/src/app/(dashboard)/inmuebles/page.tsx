"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Plus, RefreshCw, Loader2, Pencil } from "lucide-react";
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
import { propertiesApi } from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";
import type {
  Property,
  PropertyStatus,
  PropertyType,
} from "@/lib/api/types";

const PROPERTY_TYPES: PropertyType[] = ["LOTE", "CASA", "DEPTO", "DUPLEX"];
const PROPERTY_STATUSES: PropertyStatus[] = [
  "DISPONIBLE",
  "RESERVADO",
  "VENDIDO",
  "EN_CONSTRUCCION",
  "ENTREGADO",
];

const statusColor: Record<PropertyStatus, string> = {
  DISPONIBLE: "bg-emerald-100 text-emerald-700",
  RESERVADO: "bg-amber-100 text-amber-700",
  VENDIDO: "bg-indigo-100 text-indigo-700",
  EN_CONSTRUCCION: "bg-violet-100 text-violet-700",
  ENTREGADO: "bg-sky-100 text-sky-700",
};

const createSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  type: z.enum(PROPERTY_TYPES as [string, ...string[]]),
  address: z.string().min(3, "Dirección mínimo 3 caracteres"),
  zone: z.string().min(2, "Zona mínimo 2 caracteres"),
  m2: z.coerce.number().min(0.01, "m² mayor a 0"),
});
type CreateForm = z.infer<typeof createSchema>;

const updateSchema = z.object({
  address: z.string().min(3),
  zone: z.string().min(2),
  m2: z.coerce.number().min(0.01),
  status: z.enum(PROPERTY_STATUSES as [string, ...string[]]),
});
type UpdateForm = z.infer<typeof updateSchema>;

export default function InmueblesPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = React.useState<PropertyStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Property | null>(null);

  const propsQ = useQuery({
    queryKey: ["properties"],
    queryFn: propertiesApi.list,
  });

  const createMut = useMutation({
    mutationFn: (dto: CreateForm) =>
      propertiesApi.create({
        code: dto.code,
        type: dto.type as PropertyType,
        address: dto.address,
        zone: dto.zone,
        m2: dto.m2,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["dash", "properties"] });
      toast.success("Inmueble creado");
      setCreateOpen(false);
    },
    onError: (e) => toast.error("Error al crear", { description: extractApiError(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateForm }) =>
      propertiesApi.update(id, {
        address: dto.address,
        zone: dto.zone,
        m2: dto.m2,
        status: dto.status as PropertyStatus,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["dash", "properties"] });
      toast.success("Inmueble actualizado");
      setEditing(null);
    },
    onError: (e) => toast.error("Error al actualizar", { description: extractApiError(e) }),
  });

  const items: Property[] = propsQ.data ?? [];
  const filtered =
    filterStatus === "ALL"
      ? items
      : items.filter((i) => i.status === filterStatus);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] space-y-5 p-6 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              § Inmuebles · {items.length} en cartera
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
              <Building2 className="h-7 w-7 text-indigo-600" />
              Catálogo de inmuebles
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Propiedades en distintas etapas del ciclo comercial.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => propsQ.refetch()}
              disabled={propsQ.isFetching}
            >
              <RefreshCw className={propsQ.isFetching ? "animate-spin" : ""} />
              Recargar
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              Nuevo inmueble
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-1.5">
          {(["ALL", ...PROPERTY_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                filterStatus === s
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {s === "ALL" ? `Todos · ${items.length}` : `${s} · ${items.filter((i) => i.status === s).length}`}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {propsQ.isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Sin inmuebles en este estado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead className="text-right">m²</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-700">
                      {p.code}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {p.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{p.address}</TableCell>
                    <TableCell className="text-sm text-slate-600">{p.zone}</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {Number(p.m2).toFixed(0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${statusColor[p.status]}`}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
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

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={(d) => createMut.mutate(d)} isLoading={createMut.isPending} />
      <EditDialog property={editing} onClose={() => setEditing(null)} onSubmit={(d) => editing && updateMut.mutate({ id: editing.id, dto: d })} isLoading={updateMut.isPending} />
    </div>
  );
}

function CreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (d: CreateForm) => void;
  isLoading: boolean;
}) {
  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { code: "", type: "CASA", address: "", zone: "", m2: 100 },
  });

  React.useEffect(() => {
    if (open) form.reset({ code: "", type: "CASA", address: "", zone: "", m2: 100 });
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo inmueble</DialogTitle>
          <DialogDescription>Se creará en estado DISPONIBLE.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input id="code" placeholder="INM-001" {...form.register("code")} />
              {form.formState.errors.code && <p className="mt-1 text-xs text-destructive">{form.formState.errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <select id="type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("type")}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" placeholder="Av. Banzer 1234" {...form.register("address")} />
            {form.formState.errors.address && <p className="mt-1 text-xs text-destructive">{form.formState.errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="zone">Zona</Label>
              <Input id="zone" placeholder="Norte" {...form.register("zone")} />
              {form.formState.errors.zone && <p className="mt-1 text-xs text-destructive">{form.formState.errors.zone.message}</p>}
            </div>
            <div>
              <Label htmlFor="m2">m²</Label>
              <Input id="m2" type="number" step="0.01" {...form.register("m2")} />
              {form.formState.errors.m2 && <p className="mt-1 text-xs text-destructive">{form.formState.errors.m2.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  property,
  onClose,
  onSubmit,
  isLoading,
}: {
  property: Property | null;
  onClose: () => void;
  onSubmit: (d: UpdateForm) => void;
  isLoading: boolean;
}) {
  const form = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    defaultValues: { address: "", zone: "", m2: 100, status: "DISPONIBLE" },
  });

  React.useEffect(() => {
    if (property) {
      form.reset({
        address: property.address,
        zone: property.zone,
        m2: Number(property.m2),
        status: property.status,
      });
    }
  }, [property, form]);

  return (
    <Dialog open={!!property} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar inmueble</DialogTitle>
          <DialogDescription className="font-mono text-xs">{property?.code}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="e-address">Dirección</Label>
            <Input id="e-address" {...form.register("address")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="e-zone">Zona</Label>
              <Input id="e-zone" {...form.register("zone")} />
            </div>
            <div>
              <Label htmlFor="e-m2">m²</Label>
              <Input id="e-m2" type="number" step="0.01" {...form.register("m2")} />
            </div>
          </div>
          <div>
            <Label htmlFor="e-status">Estado</Label>
            <select id="e-status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}>
              {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
