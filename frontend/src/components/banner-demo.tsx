import { Beaker } from "lucide-react";

export function BannerDemo() {
  if (process.env.NEXT_PUBLIC_USE_MOCKS !== "true") return null;

  return (
    <div className="shrink-0 bg-amber-400 px-4 py-2 flex items-center justify-center gap-2.5 text-xs font-bold text-amber-950 border-b border-amber-500/50">
      <Beaker className="h-3.5 w-3.5 shrink-0" />
      <span>
        MODO DEMO — Patrón Indirección y Pure Fabrication Aplicado
      </span>
      <span className="hidden sm:inline-flex items-center gap-1 bg-amber-950/15 px-2 py-0.5 rounded text-[10px] font-black tracking-wide border border-amber-600/30">
        NEXT_PUBLIC_USE_MOCKS=true
      </span>
    </div>
  );
}
