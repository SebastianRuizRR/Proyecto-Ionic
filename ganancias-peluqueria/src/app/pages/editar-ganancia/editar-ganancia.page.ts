import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { IonContent, IonHeader, IonRouterOutlet, NavController } from '@ionic/angular';

import { CabeceraSecundariaComponent } from '../../components/cabecera-secundaria/cabecera-secundaria.component';
import { CamposGananciaComponent } from '../../components/campos-ganancia/campos-ganancia.component';
import { Ganancia } from '../../models/ganancia.model';
import { catalogo, servicioId } from '../../models/servicio.model';
import { AuthService } from '../../services/auth.service';
import { GananciasService } from '../../services/ganancias.service';
import { ToastService } from '../../services/toast.service';
import {
  etiquetaDia,
  fechaCorta,
  fechaISO,
  leerFecha,
  sumarDias,
  sumarMinutos
} from '../../utils/formato';
import { volverAtras } from '../../utils/navegacion';

const PROPINAS = [0, 1000, 2000, 3000, 5000];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const PASO_MINUTOS = 15;

@Component({
  selector: 'app-editar-ganancia',
  templateUrl: './editar-ganancia.page.html',
  styleUrls: ['./editar-ganancia.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, CabeceraSecundariaComponent, CamposGananciaComponent]
})
export class EditarGananciaPage {

  /** Viene del parámetro :id de la URL (withComponentInputBinding). */
  readonly id = input.required<string>();

  private readonly gananciasService = inject(GananciasService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(NavController);
  private readonly outlet = inject(IonRouterOutlet, { optional: true });

  readonly propinas = PROPINAS;
  readonly servicios = computed(() => catalogo(this.auth.usuario()?.precios));
  readonly listo = this.gananciasService.listo;
  readonly hoy = fechaISO(new Date());

  readonly original = computed(() =>
    this.gananciasService.obtenerPorId(this.id())
  );

  readonly servicioId = signal<string | null>(null);
  readonly nombreOtro = signal('');
  readonly digitos = signal('');
  readonly propina = signal(0);
  readonly propinaLibre = signal(false);
  readonly fecha = signal('');
  readonly hora = signal('');
  readonly notas = signal('');
  readonly guardando = signal(false);

  private precargada = false;

  constructor() {
    // Precarga el formulario apenas llegan los datos. Tras recargar la
    // página la lista todavía no está, así que no se puede hacer al construir.
    effect(() => {
      const ganancia = this.original();
      if (ganancia && !this.precargada) {
        this.precargada = true;
        untracked(() => this.precargar(ganancia));
      }
    });
  }

  readonly monto = computed(() => Number(this.digitos() || 0));

  private readonly nombreServicio = computed(() => {
    const id = this.servicioId();
    if (id === 'otro') return this.nombreOtro().trim() || 'Otro';
    return this.servicios().find(s => s.id === id)?.nombre ?? '';
  });

  readonly antetitulo = computed(() => {
    const g = this.original();
    return g ? `${g.servicio} · ${etiquetaDia(g.fecha, this.hoy)} · ${g.hora}` : 'Registro';
  });

  readonly fechaTexto = computed(() => {
    const fecha = this.fecha();
    if (!fecha) return '';
    const etiqueta = etiquetaDia(fecha, this.hoy);
    return etiqueta === 'Hoy' || etiqueta === 'Ayer'
      ? `${etiqueta}, ${fechaCorta(fecha)}`
      : `${DIAS_CORTOS[leerFecha(fecha).getDay()]} ${fechaCorta(fecha)}`;
  });

  readonly puedeAvanzarDia = computed(() => this.fecha() < this.hoy);

  private readonly hayCambios = computed(() => {
    const g = this.original();
    if (!g) return false;
    return this.nombreServicio() !== g.servicio
      || this.monto() !== g.monto
      || this.propina() !== g.propina
      || this.fecha() !== g.fecha
      || this.hora() !== g.hora
      || this.notas().trim() !== g.notas;
  });

  readonly puedeGuardar = computed(() =>
    this.monto() > 0 && !!this.servicioId() && this.hayCambios() && !this.guardando()
  );

  diaAnterior(): void {
    this.fecha.update(f => sumarDias(f, -1));
  }

  diaSiguiente(): void {
    if (this.puedeAvanzarDia()) this.fecha.update(f => sumarDias(f, 1));
  }

  horaMenos(): void {
    this.hora.update(h => sumarMinutos(h, -PASO_MINUTOS));
  }

  horaMas(): void {
    this.hora.update(h => sumarMinutos(h, PASO_MINUTOS));
  }

  escribirNotas(evento: Event): void {
    this.notas.set((evento.target as HTMLInputElement).value);
  }

  async guardar(): Promise<void> {
    if (!this.puedeGuardar()) return;

    this.guardando.set(true);
    try {
      await this.gananciasService.actualizar(this.id(), {
        servicio: this.nombreServicio(),
        monto: this.monto(),
        propina: this.propina(),
        fecha: this.fecha(),
        hora: this.hora(),
        notas: this.notas().trim()
      });
      this.toast.mostrar('Cambios guardados');
      this.volver();
    } catch (error) {
      this.toast.mostrar('No se pudo guardar: ' + (error as Error).message);
    } finally {
      this.guardando.set(false);
    }
  }

  volver(): void {
    volverAtras(this.nav, this.outlet, `/ganancia/${this.id()}`);
  }

  private precargar(g: Ganancia): void {
    const id = servicioId(g.servicio);
    this.servicioId.set(id);
    this.nombreOtro.set(id === 'otro' && g.servicio !== 'Otro' ? g.servicio : '');
    this.digitos.set(String(g.monto));
    this.propina.set(g.propina);
    this.propinaLibre.set(!PROPINAS.includes(g.propina));
    this.fecha.set(g.fecha);
    this.hora.set(g.hora);
    this.notas.set(g.notas);
  }
}
