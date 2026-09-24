import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonHeader } from '@ionic/angular';

import { EncabezadoComponent } from '../../components/encabezado/encabezado.component';
import { GananciasService } from '../../services/ganancias.service';
import {
  clp,
  fechaISO,
  leerFecha,
  nombreMes,
  sumaMontos
} from '../../utils/formato';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, EncabezadoComponent]
})
export class EstadisticasPage {

  private readonly gananciasService = inject(GananciasService);

  readonly diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  readonly hoy = signal(fechaISO(new Date()));
  readonly diaElegido = signal(this.hoy());

  private readonly mes = computed(() => this.hoy().slice(0, 7));

  private readonly delMes = computed(() =>
    this.gananciasService.ganancias().filter(g => g.fecha.startsWith(this.mes()))
  );

  readonly etiquetaMes = computed(() => {
    const fecha = leerFecha(this.hoy());
    const mes = nombreMes(fecha.getMonth());
    return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${fecha.getFullYear()}`;
  });

  readonly totalMes = computed(() => clp(sumaMontos(this.delMes())));

  private readonly porServicio = computed(() => {
    const totales = new Map<string, number>();
    for (const g of this.delMes()) {
      totales.set(g.servicio, (totales.get(g.servicio) ?? 0) + g.monto);
    }
    return [...totales]
      .map(([nombre, monto]) => ({ nombre, monto }))
      .filter(s => s.monto > 0)
      .sort((a, b) => b.monto - a.monto);
  });

  readonly masRentable = computed(() => {
    const primero = this.porServicio()[0];
    return primero
      ? { nombre: primero.nombre, monto: clp(primero.monto) }
      : { nombre: '—', monto: clp(0) };
  });

  readonly distribucion = computed(() => {
    const servicios = this.porServicio();
    const total = servicios.reduce((suma, s) => suma + s.monto, 0);
    const maximo = servicios[0]?.monto ?? 1;
    return servicios.map(s => ({
      nombre: s.nombre,
      monto: clp(s.monto),
      porcentaje: Math.round((s.monto / total) * 100) + '%',
      ancho: Math.max(6, (s.monto / maximo) * 100) + '%'
    }));
  });

  readonly celdas = computed(() => {
    const primerDia = leerFecha(this.mes() + '-01');
    const anio = primerDia.getFullYear();
    const mes = primerDia.getMonth();
    const diasDelMes = new Date(anio, mes + 1, 0).getDate();
    const desfase = (primerDia.getDay() + 6) % 7; // la semana parte el lunes

    const totales = new Map<string, number>();
    for (const g of this.delMes()) {
      totales.set(g.fecha, (totales.get(g.fecha) ?? 0) + g.monto);
    }
    const maximo = Math.max(1, ...totales.values());

    const cantidad = Math.ceil((desfase + diasDelMes) / 7) * 7;
    return Array.from({ length: cantidad }, (_, i) => {
      const dia = i - desfase + 1;
      if (dia < 1 || dia > diasDelMes) {
        return { clave: 'vacia-' + i, dia: null, fecha: '', total: 0, intensidad: 0, futuro: false };
      }
      const fecha = fechaISO(new Date(anio, mes, dia));
      const total = totales.get(fecha) ?? 0;
      return {
        clave: fecha,
        dia,
        fecha,
        total,
        intensidad: 0.35 + 0.65 * (total / maximo),
        futuro: fecha > this.hoy()
      };
    });
  });

  private readonly delDia = computed(() =>
    this.delMes()
      .filter(g => g.fecha === this.diaElegido())
      .sort((a, b) => a.hora.localeCompare(b.hora))
  );

  readonly etiquetaDia = computed(() => {
    const fecha = leerFecha(this.diaElegido());
    return `${fecha.getDate()} de ${nombreMes(fecha.getMonth())}`;
  });
  readonly totalDia = computed(() => clp(sumaMontos(this.delDia())));
  readonly cantidadDia = computed(() => this.delDia().length);
  readonly filasDia = computed(() =>
    this.delDia().map(g => ({ id: g.id, hora: g.hora, nombre: g.servicio, monto: clp(g.monto) }))
  );

  ionViewWillEnter(): void {
    const hoy = fechaISO(new Date());
    if (hoy !== this.hoy()) {
      this.hoy.set(hoy);
      this.diaElegido.set(hoy);
    }
  }
}
