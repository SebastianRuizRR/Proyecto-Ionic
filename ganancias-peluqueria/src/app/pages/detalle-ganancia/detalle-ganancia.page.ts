import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonRouterOutlet, NavController } from '@ionic/angular';

import { CabeceraSecundariaComponent } from '../../components/cabecera-secundaria/cabecera-secundaria.component';
import { IconoServicioComponent } from '../../components/icono-servicio/icono-servicio.component';
import { GananciasService } from '../../services/ganancias.service';
import { ToastService } from '../../services/toast.service';
import { clp, fechaConDia } from '../../utils/formato';
import { volverAtras } from '../../utils/navegacion';

@Component({
  selector: 'app-detalle-ganancia',
  templateUrl: './detalle-ganancia.page.html',
  styleUrls: ['./detalle-ganancia.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonContent,
    RouterLink,
    CabeceraSecundariaComponent,
    IconoServicioComponent
  ]
})
export class DetalleGananciaPage {

  /** Viene del parámetro :id de la URL (withComponentInputBinding). */
  readonly id = input.required<string>();

  private readonly gananciasService = inject(GananciasService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(NavController);
  private readonly outlet = inject(IonRouterOutlet, { optional: true });

  readonly listo = this.gananciasService.listo;

  readonly ganancia = computed(() =>
    this.gananciasService.obtenerPorId(this.id())
  );

  readonly vista = computed(() => {
    const g = this.ganancia();
    if (!g) return null;
    return {
      ...g,
      cuando: `${fechaConDia(g.fecha)} · ${g.hora}`,
      montoTexto: clp(g.monto),
      propinaTexto: '+' + clp(g.propina),
      totalTexto: clp(g.monto + g.propina)
    };
  });

  readonly confirmando = signal(false);
  readonly eliminando = signal(false);

  async eliminar(): Promise<void> {
    if (this.eliminando()) return;

    this.eliminando.set(true);
    try {
      await this.gananciasService.eliminar(this.id());
      this.toast.mostrar('Registro eliminado');
      volverAtras(this.nav, this.outlet, '/app/historial');
    } catch (error) {
      this.toast.mostrar('No se pudo eliminar: ' + (error as Error).message);
    } finally {
      this.eliminando.set(false);
    }
  }
}
