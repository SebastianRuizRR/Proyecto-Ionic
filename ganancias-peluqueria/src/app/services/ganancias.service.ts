import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  Ganancia,
  NuevaGanancia
} from '../models/ganancia.model';

import { SupabaseService } from './supabase.service';

interface GananciaSupabase {
  id: string;
  servicio: string;
  monto: number;
  propina: number;
  fecha: string;
  hora: string;
  notas: string;
}

@Injectable({
  providedIn: 'root'
})
export class GananciasService {

  private readonly supabase =
    inject(SupabaseService).client;

  private readonly lista =
    signal<Ganancia[]>([]);

  readonly ganancias =
    this.lista.asReadonly();

  readonly cantidad = computed(
    () => this.lista().length
  );

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, ganancia) =>
        suma +
        ganancia.monto +
        ganancia.propina,
      0
    )
  );

  constructor() {
    void this.cargar();

    this.supabase.auth.onAuthStateChange(
      (_evento, sesion) => {
        if (sesion?.user) {
          queueMicrotask(() => {
            void this.cargar();
          });
        } else {
          this.lista.set([]);
        }
      }
    );
  }

  async cargar(): Promise<void> {
    const { data: sesionData } =
      await this.supabase.auth.getSession();

    if (!sesionData.session) {
      this.lista.set([]);
      return;
    }

    const { data, error } = await this.supabase
      .from('ganancias')
      .select(`
        id,
        servicio,
        monto,
        propina,
        fecha,
        hora,
        notas
      `)
      .order('fecha', {
        ascending: false
      })
      .order('hora', {
        ascending: false
      });

    if (error) {
      throw new Error(error.message);
    }

    const ganancias = (
      data as GananciaSupabase[]
    ).map(fila => this.convertir(fila));

    this.lista.set(ganancias);
  }

  async crear(
    datos: NuevaGanancia
  ): Promise<void> {

    const { data: usuarioData, error: usuarioError } =
      await this.supabase.auth.getUser();

    if (usuarioError || !usuarioData.user) {
      throw new Error(
        'Debes iniciar sesión para registrar una ganancia'
      );
    }

    const { data, error } = await this.supabase
      .from('ganancias')
      .insert({
        user_id: usuarioData.user.id,
        servicio: datos.servicio,
        monto: datos.monto,
        propina: datos.propina,
        fecha: datos.fecha,
        hora: datos.hora,
        notas: datos.notas
      })
      .select(`
        id,
        servicio,
        monto,
        propina,
        fecha,
        hora,
        notas
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const nueva =
      this.convertir(data as GananciaSupabase);

    this.lista.update(ganancias => [
      nueva,
      ...ganancias
    ]);
  }

  obtenerPorId(
    id: string
  ): Ganancia | undefined {

    return this.lista().find(
      ganancia => ganancia.id === id
    );
  }

  async actualizar(
    id: string,
    datos: NuevaGanancia
  ): Promise<void> {

    const { data, error } = await this.supabase
      .from('ganancias')
      .update({
        servicio: datos.servicio,
        monto: datos.monto,
        propina: datos.propina,
        fecha: datos.fecha,
        hora: datos.hora,
        notas: datos.notas
      })
      .eq('id', id)
      .select(`
        id,
        servicio,
        monto,
        propina,
        fecha,
        hora,
        notas
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const actualizada =
      this.convertir(data as GananciaSupabase);

    this.lista.update(ganancias =>
      ganancias.map(ganancia =>
        ganancia.id === id
          ? actualizada
          : ganancia
      )
    );
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ganancias')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    this.lista.update(ganancias =>
      ganancias.filter(
        ganancia => ganancia.id !== id
      )
    );
  }

  private convertir(
    fila: GananciaSupabase
  ): Ganancia {

    return {
      id: fila.id,
      servicio: fila.servicio,
      monto: Number(fila.monto),
      propina: Number(fila.propina),
      fecha: fila.fecha,
      hora: fila.hora.slice(0, 5),
      notas: fila.notas
    };
  }
}