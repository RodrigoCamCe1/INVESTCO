export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Investco ERP
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Sistema de Gestión y Control de Avance de Obras
        </p>

        <div className="space-y-4">
          <a
            href="/auth/login"
            className="inline-block px-8 py-3 bg-white text-brand-primary font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>

        <p className="mt-12 text-white/60 text-sm">
          © 2026 Investco. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
