import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Investco Obra — PWA Campo",
  description: "Aplicación móvil offline para personal de campo",
}

export default function ObraMobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-900 min-h-screen font-sans antialiased">
        <main className="max-w-md mx-auto min-h-screen flex flex-col relative bg-slate-900">
          {children}
        </main>
      </body>
    </html>
  )
}
