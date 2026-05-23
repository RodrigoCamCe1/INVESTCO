/**
 * Formatea un string numérico a formato boliviano (Bs.)
 * Ejemplo: "150000.50" -> "Bs. 150,000.50"
 */
export function formatMoney(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "Bs. 0.00";
  
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB", // The requirement said "Bs." which is BOB.
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num).replace("BOB", "Bs.");
}
