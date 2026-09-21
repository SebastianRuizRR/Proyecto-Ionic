export interface Ganancia {
  id: string;
  servicio: string;
  monto: number;
  propina: number;
  fecha: string;
  hora: string;
  notas: string;
}

export type NuevaGanancia = Omit<Ganancia, 'id'>;