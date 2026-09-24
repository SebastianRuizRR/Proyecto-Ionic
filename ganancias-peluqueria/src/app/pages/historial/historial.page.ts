import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular';

import { EncabezadoComponent } from '../../components/encabezado/encabezado.component';
import { Ganancia } from '../../models/ganancia.model';
import { SERVICIOS, servicioId } from '../../models/servicio.model';
import { GananciasService } from '../../services/ganancias.service';
import {
  clp,
  etiquetaDia,
  fechaISO,
  inicioSemana,
  ordenarRecientes,
  sumaMontos
} from '../../utils/formato';

type Periodo = 'dia' | 'semana' | 'mes';

const TOTAL_PERIODO: Record<Periodo, string> = {
  dia: 'Total de hoy',
  semana: 'Total de la semana',
  mes: 'Total del mes'
};

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, RouterLink, EncabezadoComponent]
})
export class HistorialPage {

  private readonly gananciasService = inject(GananciasService);

  readonly periodos: { id: Periodo; texto: string }[] = [
    { id: 'dia', texto: 'Día' },
    { id: 'semana', texto: 'Semana' },
    { id: 'mes', texto: 'Mes' }
  ];
  readonly filtros = [{ id: 'todos', nombre: 'Todos' }, ...SERVICIOS];

  readonly hoy = signal(fechaISO(new Date()));
  readonly periodo = signal<Periodo>('dia');
  readonly filtro = signal('todos');
  readonly busqueda = signal('');

  private readonly filtradas = computed(() => {
    const hoy = this.hoy();
    const desde = {
      dia: hoy,
      semana: inicioSemana(hoy),
      mes: hoy.slice(0, 7) + '-01'
    }[this.periodo()];

    let lista = this.gananciasService.ganancias().filter(g =>
      g.fecha >= desde && g.fecha <= hoy
    );

    if (this.filtro() !== 'todos') {
      lista = lista.filter(g => servicioId(g.servicio) === this.filtro());
    }

    const texto = this.busqueda().trim().toLowerCase();
    if (texto) {
      const digitos = texto.replace(/\D/g, '');
      lista = lista.filter(g =>
        g.servicio.toLowerCase().includes(texto) ||
        g.notas.toLowerCase().includes(texto) ||
        (!!digitos && String(g.monto).includes(digitos))
      );
    }

    return ordenarRecientes(lista);
  });

  readonly etiquetaTotal = computed(() => TOTAL_PERIODO[this.periodo()]);
  readonly cantidad = computed(() => this.filtradas().length);
  readonly total = computed(() => clp(sumaMontos(this.filtradas())));

  readonly grupos = computed(() => {
    const porDia = new Map<string, Ganancia[]>();
    for (const g of this.filtradas()) {
      porDia.set(g.fecha, [...(porDia.get(g.fecha) ?? []), g]);
    }

    return [...porDia].map(([fecha, ganancias]) => ({
      fecha,
      etiqueta: etiquetaDia(fecha, this.hoy()),
      total: clp(sumaMontos(ganancias)),
      filas: ganancias.map(g => ({
        id: g.id,
        hora: g.hora,
        nombre: g.servicio,
        detalle: g.propina ? 'Propina ' + clp(g.propina) : g.notas,
        monto: clp(g.monto)
      }))
    }));
  });

  ionViewWillEnter(): void {
    this.hoy.set(fechaISO(new Date()));
  }

  buscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }
}
