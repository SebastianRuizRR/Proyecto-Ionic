export interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  inicial: string;
}

export const SERVICIOS: Servicio[] = [
  { id: 'barba', nombre: 'Corte barba', precio: 17000, inicial: 'B' },
  { id: 'cabello', nombre: 'Corte cabello', precio: 22000, inicial: 'C' },
  { id: 'nino', nombre: 'Corte niño', precio: 17000, inicial: 'N' },
  { id: 'ambos', nombre: 'Cabello + barba', precio: 35000, inicial: 'A' },
  { id: 'otro', nombre: 'Otro', precio: 0, inicial: '·' },
];

/** Id del catálogo al que pertenece un nombre de servicio guardado ('otro' si no coincide). */
export function servicioId(nombre: string): string {
  return SERVICIOS.find(s => s.nombre === nombre)?.id ?? 'otro';
}

export function inicialServicio(nombre: string): string {
  const servicio = SERVICIOS.find(s => s.nombre === nombre);
  return servicio?.inicial ?? (nombre.trim().charAt(0).toUpperCase() || '·');
}
