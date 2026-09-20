import { Injectable, computed, signal } from '@angular/core';

import {
  Ganancia,
  NuevaGanancia,
} from '../models/ganancia.model';

const HOY = new Date().toLocaleDateString('en-CA');

@Injectable({
  providedIn: 'root',
})
export class GananciasService {
  private readonly registros = signal<Ganancia[]>([
    {
      id: '1',
      servicio: 'Cabello + barba',
      monto: 35000,
      propina: 3000,
      fecha: HOY,
      hora: '14:30',
      notas: 'Cliente frecuente',
    },
    {
      id: '2',
      servicio: 'Corte cabello',
      monto: 22000,
      propina: 0,
      fecha: HOY,
      hora: '13:15',
      notas: '',
    },
  ]);

  readonly ganancias = this.registros.asReadonly();

  readonly cantidad = computed(() => {
    return this.registros().length;
  });

  readonly total = computed(() => {
    return this.registros().reduce(
      (suma, registro) =>
        suma + registro.monto + registro.propina,
      0
    );
  });

  crear(datos: NuevaGanancia): Ganancia {
    const nueva: Ganancia = {
      id: crypto.randomUUID(),
      ...datos,
    };

    this.registros.update((actuales) => [
      nueva,
      ...actuales,
    ]);

    return nueva;
  }

  obtenerPorId(id: string): Ganancia | undefined {
    return this.registros().find(
      (registro) => registro.id === id
    );
  }
}