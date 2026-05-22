"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthSession } from "@/providers/auth-session-provider";
import type { MockRoleCode } from "@/constants/permissions";
import { MOCK_PASSWORD } from "@/lib/mock-auth";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(12, "La contraseña debe tener al menos 12 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const QUICK_ROLES: Array<{ role: MockRoleCode; label: string; description: string }> =
  [
    {
      role: "ADMIN",
      label: "Ingresar como Administrador",
      description: "Rol ADMIN — acceso total",
    },
    {
      role: "VENDEDOR",
      label: "Ingresar como Vendedor",
      description: "Comercial y reservas",
    },
    {
      role: "ENCARG_PROYECTO",
      label: "Ingresar como Encargado de Proyecto",
      description: "Gestión de obra",
    },
  ];

export function LoginForm() {
  const router = useRouter();
  const { login, loginAsRole } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const completeLogin = () => {
    toast.success("Sesión iniciada con éxito");
    router.push("/dashboard");
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const ok = login(data.email, data.password);
      if (!ok) {
        toast.error("Credenciales incorrectas", {
          description:
            "Verifique el correo y la contraseña. En modo demo use los usuarios de prueba.",
        });
        return;
      }
      completeLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: MockRoleCode) => {
    loginAsRole(role);
    completeLogin();
  };

  const fillDemoCredentials = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", MOCK_PASSWORD, { shouldValidate: true });
  };

  return (
    <Card className="w-full max-w-md border-white/20 bg-white/95 shadow-2xl backdrop-blur-sm">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
          <Building2 className="h-8 w-8" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Investco
          </p>
          <CardTitle className="text-2xl text-slate-900">
            Sistema de Control de Obra
          </CardTitle>
          <CardDescription>
            Caso de Uso #30 — Autenticación (prototipo con mocks)
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@investco.com"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Mínimo 12 caracteres"
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Ingresando…
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>

        {process.env.NEXT_PUBLIC_USE_MOCKS === "true" && (
          <div className="space-y-3 border-t pt-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Ingreso Rápido
              </h2>
              <p className="text-xs text-muted-foreground">
                Simula roles del sistema sin escribir credenciales
              </p>
            </div>
            <div className="grid gap-2">
              {QUICK_ROLES.map((item) => (
                <Button
                  key={item.role}
                  type="button"
                  variant="outline"
                  className="h-auto flex-col items-start gap-0.5 py-3 text-left"
                  onClick={() => handleQuickLogin(item.role)}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {item.description}
                  </span>
                </Button>
              ))}
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Datos de prueba</p>
              <button
                type="button"
                className="mt-1 block text-left hover:text-amber-800"
                onClick={() => fillDemoCredentials("admin@investco.com")}
              >
                Admin: admin@investco.com / {MOCK_PASSWORD}
              </button>
              <button
                type="button"
                className="mt-1 block text-left hover:text-amber-800"
                onClick={() => fillDemoCredentials("ventas@investco.com")}
              >
                Vendedor: ventas@investco.com / {MOCK_PASSWORD}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
