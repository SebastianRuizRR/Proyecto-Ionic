import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular';

import { EncabezadoComponent } from '../../components/encabezado/encabezado.component';
import { inicialServicio } from '../../models/servicio.model';
import { GananciasService } from '../../services/ganancias.service';
import {
  clp,
  clpCorto,
  etiquetaDia,
  fechaCorta,
  fechaISO,
  fechaLarga,
  inicioSemana,
  ordenarRecientes,
  sumaMontos,
  sumaPropinas
} from '../../utils/formato';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, RouterLink, EncabezadoComponent]
})
export class InicioPage {

  private readonly gananciasService = inject(GananciasService);

  readonly hoy = signal(fechaISO(new Date()));

  private readonly deHoy = computed(() =>
    this.gananciasService.ganancias().filter(g => g.fecha === this.hoy())
  );

  private readonly delMes = computed(() =>
    this.gananciasService.ganancias().filter(g =>
      g.fecha.startsWith(this.hoy().slice(0, 7))
    )
  );

  readonly antetitulo = computed(() => fechaLarga(this.hoy()));
  readonly fechaCorta = computed(() => fechaCorta(this.hoy()));

  readonly totalHoy = computed(() => clp(sumaMontos(this.deHoy())));
  readonly cantidadHoy = computed(() => this.deHoy().length);
  readonly propinasHoy = computed(() => sumaPropinas(this.deHoy()));
  readonly propinasHoyTexto = computed(() => clp(this.propinasHoy()));

  readonly totalSemana = computed(() => {
    const desde = inicioSemana(this.hoy());
    const semana = this.gananciasService.ganancias().filter(g =>
      g.fecha >= desde && g.fecha <= this.hoy()
    );
    return clpCorto(sumaMontos(semana));
  });

  readonly totalMes = computed(() => clpCorto(sumaMontos(this.delMes())));
  readonly cortesMes = computed(() => this.delMes().length);

  readonly ultimas = computed(() =>
    ordenarRecientes(this.gananciasService.ganancias())
      .slice(0, 4)
      .map(g => ({
        id: g.id,
        inicial: inicialServicio(g.servicio),
        nombre: g.servicio,
        cuando: `${etiquetaDia(g.fecha, this.hoy())} · ${g.hora}`,
        monto: clp(g.monto)
      }))
  );

  ionViewWillEnter(): void {
    this.hoy.set(fechaISO(new Date()));
  }
}
