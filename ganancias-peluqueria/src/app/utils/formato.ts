import { Ganancia } from '../models/ganancia.model';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export function clp(monto: number): string {
  return '$' + Math.round(monto).toLocaleString('es-CL');
}

export function clpCorto(monto: number): string {
  return monto >= 1000000
    ? '$' + (monto / 1000000).toFixed(1).replace('.', ',') + 'M'
    : clp(monto);
}

/** Fecha local en formato YYYY-MM-DD (el mismo que guarda GananciasService). */
export function fechaISO(fecha: Date): string {
  return fecha.toLocaleDateString('en-CA');
}

export function horaActual(): string {
  return new Date().toTimeString().slice(0, 5);
}

export function leerFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = leerFecha(iso);
  fecha.setDate(fecha.getDate() + dias);
  return fechaISO(fecha);
}

/** Lunes de la semana de la fecha dada. */
export function inicioSemana(iso: string): string {
  const diasDesdeLunes = (leerFecha(iso).getDay() + 6) % 7;
  return sumarDias(iso, -diasDesdeLunes);
}

export function nombreMes(mes: number): string {
  return MESES[mes];
}

/** "Martes 23 de septiembre" */
export function fechaLarga(iso: string): string {
  const fecha = leerFecha(iso);
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

/** "23 sep" */
export function fechaCorta(iso: string): string {
  const fecha = leerFecha(iso);
  return `${fecha.getDate()} ${MESES[fecha.getMonth()].slice(0, 3)}`;
}

/** "Hoy", "Ayer" o "Lunes 21 sep" */
export function etiquetaDia(iso: string, hoy: string): string {
  if (iso === hoy) return 'Hoy';
  if (iso === sumarDias(hoy, -1)) return 'Ayer';
  return `${DIAS[leerFecha(iso).getDay()]} ${fechaCorta(iso)}`;
}

export function sumaMontos(ganancias: Ganancia[]): number {
  return ganancias.reduce((suma, g) => suma + g.monto, 0);
}

export function sumaPropinas(ganancias: Ganancia[]): number {
  return ganancias.reduce((suma, g) => suma + g.propina, 0);
}

/** Más recientes primero. */
export function ordenarRecientes(ganancias: Ganancia[]): Ganancia[] {
  return [...ganancias].sort((a, b) =>
    b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora)
  );
}
