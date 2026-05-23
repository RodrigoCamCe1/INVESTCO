import { formatMoney } from "@/lib/money"

interface MoneyDisplayProps {
  amount: string
  className?: string
  prefix?: string
  colored?: boolean // positive = green, negative = red
}

/**
 * Componente reutilizable para mostrar montos en formato boliviano Bs. X,XXX.00
 * Nunca acepta ni expone el tipo `number` primitivo en la interfaz de usuario.
 */
export function MoneyDisplay({ amount, className = "", colored = false, prefix = "" }: MoneyDisplayProps) {
  const isNegative = amount.startsWith("-")
  const colorClass = colored
    ? isNegative
      ? "text-red-600"
      : "text-emerald-600"
    : ""

  return (
    <span className={`${colorClass} ${className}`}>
      {prefix}{formatMoney(amount)}
    </span>
  )
}
