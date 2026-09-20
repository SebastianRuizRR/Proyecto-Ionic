import { Injectable, computed, signal } from '@angular/core';
import { Ganancia, NuevaGanancia } from '../models/ganancia.model';

//LOCAL STORAGE


@Injectable({
  providedIn: 'root'
})
export class GananciasService {

  private readonly clave = 'ganancias';

  private readonly lista = signal<Ganancia[]>(this.cargar());

  readonly ganancias = this.lista.asReadonly();

  readonly cantidad = computed(() => this.lista().length);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, ganancia) => suma + ganancia.monto + ganancia.propina,
      0
    )
  );

  crear(datos: NuevaGanancia): void {
    const nuevaGanancia: Ganancia = {
      id: Date.now().toString(),
      ...datos
    };

    const actualizadas = [...this.lista(), nuevaGanancia];

    this.lista.set(actualizadas);
    this.guardar(actualizadas);
  }

  obtenerPorId(id: string): Ganancia | undefined {
    return this.lista().find(ganancia => ganancia.id === id);
  }

  actualizar(id: string, datos: NuevaGanancia): void {
    const actualizadas = this.lista().map(ganancia =>
      ganancia.id === id
        ? { ...ganancia, ...datos }
        : ganancia
    );

    this.lista.set(actualizadas);
    this.guardar(actualizadas);
  }

  eliminar(id: string): void {
    const actualizadas = this.lista().filter(
      ganancia => ganancia.id !== id
    );

    this.lista.set(actualizadas);
    this.guardar(actualizadas);
  }

  private guardar(ganancias: Ganancia[]): void {
    localStorage.setItem(this.clave, JSON.stringify(ganancias));
  }

  private cargar(): Ganancia[] {
    try {
      const datos = localStorage.getItem(this.clave);
      return datos ? JSON.parse(datos) : [];
    } catch {
      return [];
    }
  }
}