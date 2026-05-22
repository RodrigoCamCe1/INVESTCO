import { Decimal } from "decimal.js";

/**
 * UTILIDADES FINANCIERAS CON PRECISIÓN DECIMAL
 * 
 * Para un ERP, la precisión en cálculos financieros es CRÍTICA.
 * Usar Decimal.js en lugar de números flotantes.
 * 
 * Casos de uso:
 * - Cálculos de montos (Bolivia usa BOB - Bolivianos)
 * - Porcentajes
 * - Intereses
 * - Impuestos
 */

// Configurar Decimal.js para Bolivia
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
  maxE: 9e15,
  minE: -9e15,
  modulo: Decimal.ROUND_HALF_UP,
});

/**
 * Sumar dos o más números financieros con precisión
 */
export function sum(...amounts: (number | string | Decimal)[]): Decimal {
  return amounts.reduce(
    (acc, amount) => acc.plus(new Decimal(amount)),
    new Decimal(0)
  );
}

/**
 * Restar dos números financieros
 */
export function subtract(
  minuend: number | string | Decimal,
  subtrahend: number | string | Decimal
): Decimal {
  return new Decimal(minuend).minus(new Decimal(subtrahend));
}

/**
 * Multiplicar con precisión
 */
export function multiply(
  multiplicand: number | string | Decimal,
  multiplier: number | string | Decimal
): Decimal {
  return new Decimal(multiplicand).times(new Decimal(multiplier));
}

/**
 * Dividir con precisión
 */
export function divide(
  dividend: number | string | Decimal,
  divisor: number | string | Decimal
): Decimal {
  return new Decimal(dividend).dividedBy(new Decimal(divisor));
}

/**
 * Calcular porcentaje de un monto
 * @example calculatePercentage(1000, 15) => 150
 */
export function calculatePercentage(
  amount: number | string | Decimal,
  percentage: number | string | Decimal
): Decimal {
  return multiply(new Decimal(amount), divide(percentage, 100));
}

/**
 * Aplicar porcentaje a un monto
 * @example applyPercentage(1000, 15) => 1150 (suma el 15%)
 */
export function applyPercentage(
  amount: number | string | Decimal,
  percentage: number | string | Decimal
): Decimal {
  const percent = new Decimal(percentage);
  return new Decimal(amount).times(new Decimal(1).plus(divide(percent, 100)));
}

/**
 * Remover porcentaje de un monto
 * @example removePercentage(1000, 10) => 909.09 (resta el 10%)
 */
export function removePercentage(
  amount: number | string | Decimal,
  percentage: number | string | Decimal
): Decimal {
  const percent = new Decimal(percentage);
  return new Decimal(amount).dividedBy(
    new Decimal(1).plus(divide(percent, 100))
  );
}

/**
 * Redondear a 2 decimales (formato para moneda)
 */
export function toFixed(
  amount: number | string | Decimal,
  decimals = 2
): Decimal {
  const decimal = new Decimal(amount);
  return decimal.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
}

/**
 * Formatear como moneda en Bolivianos (BOB)
 */
export function formatCurrency(
  amount: number | string | Decimal,
  decimals = 2
): string {
  const formatted = toFixed(amount, decimals);
  return `Bs. ${formatted
    .toNumber()
    .toLocaleString("es-BO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
}

/**
 * Comparar dos cantidades
 * @returns -1 si a < b, 0 si a === b, 1 si a > b
 */
export function compare(
  a: number | string | Decimal,
  b: number | string | Decimal
): number {
  return new Decimal(a).comparedTo(new Decimal(b));
}

/**
 * Verificar si una cantidad es cero
 */
export function isZero(amount: number | string | Decimal): boolean {
  return new Decimal(amount).isZero();
}

/**
 * Verificar si una cantidad es negativa
 */
export function isNegative(amount: number | string | Decimal): boolean {
  return new Decimal(amount).isNegative();
}

/**
 * Verificar si una cantidad es positiva
 */
export function isPositive(amount: number | string | Decimal): boolean {
  return new Decimal(amount).isPositive();
}

/**
 * Obtener el valor absoluto
 */
export function abs(amount: number | string | Decimal): Decimal {
  return new Decimal(amount).absoluteValue();
}

/**
 * Calcular promedio
 */
export function average(...amounts: (number | string | Decimal)[]): Decimal {
  if (amounts.length === 0) return new Decimal(0);
  return divide(
    sum(...amounts),
    amounts.length
  );
}

/**
 * Convertir a número (usar solo cuando sea necesario)
 * ADVERTENCIA: Puede perder precisión
 */
export function toNumber(amount: number | string | Decimal): number {
  return new Decimal(amount).toNumber();
}

/**
 * Convertir a string para almacenar en BD
 */
export function toString(amount: number | string | Decimal): string {
  return new Decimal(amount).toString();
}

/**
 * Crear instancia de Decimal
 */
export function fromString(value: string): Decimal {
  return new Decimal(value);
}

/**
 * Calcular el total con IVA (Bolivia: 13%)
 */
export function withIVA(
  amount: number | string | Decimal,
  rate = 13
): Decimal {
  return applyPercentage(amount, rate);
}

/**
 * Extraer el IVA de un monto que ya incluye IVA
 */
export function extractIVA(
  amountWithIVA: number | string | Decimal,
  rate = 13
): Decimal {
  return removePercentage(amountWithIVA, rate);
}

/**
 * Calcular descuento simple
 */
export function applyDiscount(
  amount: number | string | Decimal,
  discountPercent: number | string | Decimal
): Decimal {
  const discount = calculatePercentage(amount, discountPercent);
  return subtract(amount, discount);
}
