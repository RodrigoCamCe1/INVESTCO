/**
 * Utilidades para manejar cálculos monetarios con strings.
 * Esto evita el uso del tipo `number` primitivo y los clásicos errores de flotante.
 */

export function addMoney(a: string, b: string): string {
  const valA = parseFloat(a) || 0;
  const valB = parseFloat(b) || 0;
  return (valA + valB).toFixed(2);
}

export function subtractMoney(a: string, b: string): string {
  const valA = parseFloat(a) || 0;
  const valB = parseFloat(b) || 0;
  return (valA - valB).toFixed(2);
}

export function multiplyMoney(a: string, factor: string | number): string {
  const valA = parseFloat(a) || 0;
  const valF = typeof factor === "string" ? parseFloat(factor) : factor;
  return (valA * (valF || 0)).toFixed(2);
}

/**
 * Retorna true si a === b
 */
export function isMoneyEqual(a: string, b: string): boolean {
  return (parseFloat(a) || 0) === (parseFloat(b) || 0);
}
