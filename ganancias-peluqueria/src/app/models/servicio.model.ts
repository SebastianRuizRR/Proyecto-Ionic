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

/** Precios que el usuario definió en su perfil, por id de servicio. */
export type Precios = Partial<Record<string, number>>;

/** Catálogo con los precios del usuario aplicados sobre los de fábrica. */
export function catalogo(precios?: Precios): Servicio[] {
  return SERVICIOS.map(s =>
    s.id !== 'otro' && precios?.[s.id] !== undefined
      ? { ...s, precio: precios[s.id] as number }
      : s
  );
}

/** Id del catálogo al que pertenece un nombre de servicio guardado ('otro' si no coincide). */
export function servicioId(nombre: string): string {
  return SERVICIOS.find(s => s.nombre === nombre)?.id ?? 'otro';
}

export function inicialServicio(nombre: string): string {
  const servicio = SERVICIOS.find(s => s.nombre === nombre);
  return servicio?.inicial ?? (nombre.trim().charAt(0).toUpperCase() || '·');
}

// Íconos del diseño. Se usan como máscara CSS, así toman el color del texto.
export const ICONOS_SERVICIO: Record<string, string> = {
  barba: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path fill="black" d="M32 12C28 6 20 6 16 12C12 18 6 18 2 12C2 22 12 28 22 24C27 22 30 18 32 16C34 18 37 22 42 24C52 28 62 22 62 12C58 18 52 18 48 12C44 6 36 6 32 12Z"/></svg>',
  cabello: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"><circle cx="6.5" cy="18" r="3"/><circle cx="17.5" cy="18" r="3"/><path d="M8.6 15.8 18 3M15.4 15.8 6 3"/></svg>',
  nino: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13.5" r="8.5"/><path d="M12 5c-.4-2 1.4-3.2 3-2.2"/><circle cx="9" cy="12.5" r="1.3" fill="black" stroke="none"/><circle cx="15" cy="12.5" r="1.3" fill="black" stroke="none"/><path d="M9 16.5c1.7 1.5 4.3 1.5 6 0"/></svg>',
  ambos: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0 1 16 0v1a8 8 0 0 1-16 0z"/><path d="M4 11c3.5 0 5.5-1.5 6.5-4 1.8 2.5 5 4 9.5 4"/><path fill="black" stroke="none" d="M12 15.6c-1-1.5-3.4-1.6-4.6.2 1.6.8 3.4.6 4.6-.2 1.2.8 3 1 4.6.2-1.2-1.8-3.6-1.7-4.6-.2z"/></svg>',
};
