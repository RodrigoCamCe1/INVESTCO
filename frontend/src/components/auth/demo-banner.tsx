export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_USE_MOCKS !== "true") return null;

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-amber-950 shadow-md"
    >
      MODO 1— Integraciones (Patrón Indirección Aplicado)
    </div>
  );
}
