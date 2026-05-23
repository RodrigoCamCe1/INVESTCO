"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthSession } from "@/providers/auth-session-provider";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isAuthenticated, logout } = useAuthSession();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }

  const { user, permissions, token } = session;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user.fullName}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut />
            Cerrar sesión
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sesión simulada (CU #30)
            </CardTitle>
            <CardDescription>
              JWT ficticio y permisos persistidos en localStorage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="font-medium text-slate-700">Correo: </span>
              {user.email}
            </div>
            <div>
              <span className="font-medium text-slate-700">Roles: </span>
              {user.roles.join(", ")}
            </div>
            <div>
              <span className="font-medium text-slate-700">
                Permisos ({permissions.length}):
              </span>
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-md border bg-white p-3 font-mono text-xs text-slate-600">
                {permissions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium text-slate-700">Token (preview):</span>
              <p className="mt-1 break-all rounded-md border bg-white p-2 font-mono text-xs text-slate-500">
                {token.slice(0, 80)}…
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
