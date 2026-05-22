"use client";

import { useMemo } from "react";
import { Decimal } from "decimal.js";
import * as decimalUtils from "@/lib/decimal-utils";

/**
 * HOOK PARA OPERACIONES FINANCIERAS CON PRECISIÓN
 * 
 * Proporciona acceso a funciones de decimal.js en componentes React
 * Memoizado para optimizar renderizaciones
 */

export function usePreciseMath() {
  return useMemo(
    () => ({
      // Operaciones básicas
      sum: decimalUtils.sum,
      subtract: decimalUtils.subtract,
      multiply: decimalUtils.multiply,
      divide: decimalUtils.divide,

      // Porcentajes
      calculatePercentage: decimalUtils.calculatePercentage,
      applyPercentage: decimalUtils.applyPercentage,
      removePercentage: decimalUtils.removePercentage,

      // Formateo
      toFixed: decimalUtils.toFixed,
      formatCurrency: decimalUtils.formatCurrency,

      // Comparaciones
      compare: decimalUtils.compare,
      isZero: decimalUtils.isZero,
      isNegative: decimalUtils.isNegative,
      isPositive: decimalUtils.isPositive,

      // Utilidades
      abs: decimalUtils.abs,
      average: decimalUtils.average,
      toNumber: decimalUtils.toNumber,
      toString: decimalUtils.toString,
      fromString: decimalUtils.fromString,

      // Específicas de Bolivia
      withIVA: decimalUtils.withIVA,
      extractIVA: decimalUtils.extractIVA,
      applyDiscount: decimalUtils.applyDiscount,
    }),
    []
  );
}

/**
 * Ejemplo de uso en componente:
 * 
 * function CalculatorComponent() {
 *   const math = usePreciseMath();
 *   const total = math.formatCurrency(
 *     math.sum(1000, 500, 250)
 *   );
 *   return <div>{total}</div>;
 * }
 */
