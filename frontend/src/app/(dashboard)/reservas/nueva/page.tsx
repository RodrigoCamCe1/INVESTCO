"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { propertiesApi, clientsApi, reservationsApi } from "@/lib/api/services";
import { extractApiError } from "@/lib/api-client";

const schema = z.object({
  propertyId: z.string().uuid("Seleccione un inmueble"),
  clientId: z.string().uuid("Seleccione un cliente"),
  depositAmount: z.coerce.number().min(0.01, "Depósito mayor a 0"),
  validityDays: z.coerce.number().int().min(1).max(365),
  currency: z.enum(["BOB", "USD"]),
  refundConditions: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const fmtMoney = (n: number, c = "BOB") =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export default function NuevaReservaPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const propsQ = useQuery({ queryKey: ["properties"], queryFn: propertiesApi.list });
  const clientsQ = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });

  const availableProps = (propsQ.data ?? []).filter((p) => p.status === "DISPONIBLE");
  const eligibleClients = (clientsQ.data ?? []).filter((c) =>
    ["LEAD", "PROSPECTO"].includes(c.status),
  );

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyId: "", clientId: "", depositAmount: 5000,
      validityDays: 30, currency: "BOB", refundConditions: "",
    },
  });

  const createMut = useMutation({
    mutationFn: (d: Form) =>
      reservationsApi.create({
        propertyId: d.propertyId,
        clientId: d.clientId,
        depositAmount: d.depositAmount,
        validityDays: d.validityDays,
        currency: d.currency,
        refundConditions: d.refundConditions || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dash"] });
      toast.success("Reserva creada · inmueble y cliente actualizados a RESERVADO");
      router.push("/reservas");
    },
    onError: (e) => toast.error("Error al crear reserva", { description: extractApiError(e) }),
  });

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl space-y-5 p-6 md:p-8">
        <Link href="/reservas" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3 w-3" /> Volver a reservas
        </Link>

        <header className="border-b border-slate-200 pb-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">§ Reserva · paso 1 del flujo comercial</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
            <CalendarPlus className="h-7 w-7 text-amber-600" />
            Nueva reserva
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Al crear: Property → <strong>RESERVADO</strong>, Client → <strong>RESERVADO</strong>. Operación atómica.
          </p>
        </header>

        <form onSubmit={form.handleSubmit((d) => createMut.mutate(d))} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <Label>Inmueble (solo DISPONIBLE)</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("propertyId")}>
              <option value="">— Seleccionar inmueble —</option>
              {availableProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.type} · {p.address} · {p.zone}
                </option>
              ))}
            </select>
            {availableProps.length === 0 && <p className="mt-1 text-xs text-amber-700">No hay inmuebles DISPONIBLES. Crea uno en /inmuebles.</p>}
            {form.formState.errors.propertyId && <p className="mt-1 text-xs text-destructive">{form.formState.errors.propertyId.message}</p>}
          </div>

          <div>
            <Label>Cliente (LEAD o PROSPECTO)</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("clientId")}>
              <option value="">— Seleccionar cliente —</option>
              {eligibleClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} · CI {c.ci} · {c.status}
                </option>
              ))}
            </select>
            {eligibleClients.length === 0 && <p className="mt-1 text-xs text-amber-700">No hay clientes elegibles. Crea uno en /clientes.</p>}
            {form.formState.errors.clientId && <p className="mt-1 text-xs text-destructive">{form.formState.errors.clientId.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Depósito</Label>
              <Input type="number" step="0.01" {...form.register("depositAmount")} />
              {form.formState.errors.depositAmount && <p className="mt-1 text-xs text-destructive">{form.formState.errors.depositAmount.message}</p>}
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                {fmtMoney(Number(form.watch("depositAmount") || 0), form.watch("currency"))}
              </p>
            </div>
            <div>
              <Label>Moneda</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("currency")}>
                <option value="BOB">BOB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Días de validez</Label>
            <Input type="number" min={1} max={365} {...form.register("validityDays")} />
            {form.formState.errors.validityDays && <p className="mt-1 text-xs text-destructive">{form.formState.errors.validityDays.message}</p>}
          </div>

          <div>
            <Label>Condiciones de devolución (opcional)</Label>
            <Input placeholder="Reembolso 50% si cancela antes de…" {...form.register("refundConditions")} />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/reservas")}>Cancelar</Button>
            <Button type="submit" disabled={createMut.isPending || !availableProps.length || !eligibleClients.length}>
              {createMut.isPending && <Loader2 className="animate-spin" />}
              Crear reserva
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
