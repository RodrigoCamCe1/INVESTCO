import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Iniciar sesión | Investco ERP",
  description: "Autenticación — Caso de Uso #30",
};

export default function LoginPage() {
  return (
    <div className="relative w-full max-w-md">
      {/* Fondo arquitectónico */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-slate-950"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.85) 50%, rgba(120,53,15,0.35) 100%),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 79px,
                rgba(148,163,184,0.08) 79px,
                rgba(148,163,184,0.08) 80px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 79px,
                rgba(148,163,184,0.08) 79px,
                rgba(148,163,184,0.08) 80px
              )
            `,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-900/30 to-transparent" />
        <div className="absolute left-[10%] top-[20%] h-48 w-32 rotate-6 rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm" />
        <div className="absolute right-[15%] top-[30%] h-64 w-40 -rotate-3 rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm" />
        <div className="absolute left-[25%] bottom-[15%] h-24 w-56 rounded-sm border border-amber-500/20 bg-amber-500/10" />
      </div>

      <LoginForm />
    </div>
  );
}
