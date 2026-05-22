import {
  format,
  parse,
  parseISO,
  differenceInDays,
  differenceInHours,
  addDays,
  addMonths,
  addYears,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
} from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

/**
 * UTILIDADES DE FECHA Y HORA
 * 
 * Zona horaria: America/La_Paz (Bolivia)
 * - UTC-4 sin horario de verano
 * - Formato por defecto: es-BO
 * 
 * Casos de uso:
 * - Fechas de documentos
 * - Programación de obras
 * - Reportes con timestamps
 */

const BOLIVIA_TIMEZONE = "America/La_Paz";
const LOCALE = "es-BO";

/**
 * Obtener hora actual en zona de Bolivia
 */
export function getNowInBolivia(): Date {
  return utcToZonedTime(new Date(), BOLIVIA_TIMEZONE);
}

/**
 * Convertir fecha UTC a zona de Bolivia
 */
export function toBoliviaTime(utcDate: Date | string): Date {
  const date = typeof utcDate === "string" ? parseISO(utcDate) : utcDate;
  return utcToZonedTime(date, BOLIVIA_TIMEZONE);
}

/**
 * Convertir fecha de Bolivia a UTC
 */
export function toUTC(boliviaDate: Date): Date {
  return zonedTimeToUtc(boliviaDate, BOLIVIA_TIMEZONE);
}

/**
 * Formatear fecha corta (DD/MM/YYYY)
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: LOCALE });
}

/**
 * Formatear fecha larga (Ej: 15 de enero de 2026)
 */
export function formatLongDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: LOCALE });
}

/**
 * Formatear fecha con hora (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: LOCALE });
}

/**
 * Formatear solo la hora (HH:mm:ss)
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm:ss", { locale: LOCALE });
}

/**
 * Formatear para mostrar en UI (Ej: "Hace 2 horas", "Ayer", etc.)
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const now = getNowInBolivia();
  const diffDays = differenceInDays(now, d);
  const diffHours = differenceInHours(now, d);

  if (diffDays === 0 && diffHours === 0) return "Hace menos de una hora";
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

  return formatShortDate(d);
}

/**
 * Formatear para input type="date"
 */
export function formatForDateInput(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

/**
 * Parsear fecha desde input type="date"
 */
export function parseDateInput(dateString: string): Date {
  return parse(dateString, "yyyy-MM-dd", new Date());
}

/**
 * Obtener diferencia en días
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  return differenceInDays(date1, date2);
}

/**
 * Obtener diferencia en horas
 */
export function getHoursDifference(date1: Date, date2: Date): number {
  return differenceInHours(date1, date2);
}

/**
 * Sumar días
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/**
 * Sumar meses
 */
export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}

/**
 * Sumar años
 */
export function addYearsToDate(date: Date, years: number): Date {
  return addYears(date, years);
}

/**
 * Obtener inicio del día
 */
export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

/**
 * Obtener fin del día
 */
export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

/**
 * Obtener inicio del mes
 */
export function getStartOfMonth(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Obtener fin del mes
 */
export function getEndOfMonth(date: Date): Date {
  return endOfMonth(date);
}

/**
 * Obtener inicio del año
 */
export function getStartOfYear(date: Date): Date {
  return startOfYear(date);
}

/**
 * Obtener fin del año
 */
export function getEndOfYear(date: Date): Date {
  return endOfYear(date);
}

/**
 * Verificar si es el mismo día
 */
export function isSameDateDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Verificar si date1 es antes que date2
 */
export function isDateBefore(date1: Date, date2: Date): boolean {
  return isBefore(date1, date2);
}

/**
 * Verificar si date1 es después que date2
 */
export function isDateAfter(date1: Date, date2: Date): boolean {
  return isAfter(date1, date2);
}

/**
 * Verificar si una fecha está dentro de un rango
 */
export function isDateWithinRange(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  return isWithinInterval(date, { start: startDate, end: endDate });
}

/**
 * Obtener rango de fechas para un mes específico
 */
export function getMonthRange(
  date: Date
): {
  start: Date;
  end: Date;
} {
  return {
    start: getStartOfMonth(date),
    end: getEndOfMonth(date),
  };
}

/**
 * Obtener rango de fechas para un año específico
 */
export function getYearRange(
  date: Date
): {
  start: Date;
  end: Date;
} {
  return {
    start: getStartOfYear(date),
    end: getEndOfYear(date),
  };
}

/**
 * Convertir a ISO string para almacenar en BD
 */
export function toISOString(date: Date): string {
  // Primero convertir a UTC
  const utcDate = toUTC(date);
  return utcDate.toISOString();
}

/**
 * Obtener número de semana del año
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNumber;
}

/**
 * Obtener nombre del mes
 */
export function getMonthName(date: Date): string {
  return format(date, "MMMM", { locale: LOCALE });
}

/**
 * Obtener nombre del día de la semana
 */
export function getDayName(date: Date): string {
  return format(date, "EEEE", { locale: LOCALE });
}

/**
 * Verificar si es fin de semana
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Obtener edad desde una fecha de nacimiento
 */
export function getAge(birthDate: Date): number {
  const today = getNowInBolivia();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
