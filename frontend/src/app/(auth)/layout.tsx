import { DemoBanner } from "@/components/auth/demo-banner";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasMockBanner = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

  return (
    <div className="relative min-h-screen">
      <DemoBanner />
      <div
        className={`flex min-h-screen items-center justify-center px-4 py-12 ${hasMockBanner ? "pt-16" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
