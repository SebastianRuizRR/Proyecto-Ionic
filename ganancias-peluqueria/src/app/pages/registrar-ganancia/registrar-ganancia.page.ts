import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular';

import { CamposGananciaComponent } from '../../components/campos-ganancia/campos-ganancia.component';
import { EncabezadoComponent } from '../../components/encabezado/encabezado.component';
import { catalogo } from '../../models/servicio.model';
import { AuthService } from '../../services/auth.service';
import { GananciasService } from '../../services/ganancias.service';
import { ToastService } from '../../services/toast.service';
import { clp, fechaCorta, fechaISO, horaActual } from '../../utils/formato';

@Component({
  selector: 'app-registrar-ganancia',
  templateUrl: './registrar-ganancia.page.html',
  styleUrls: ['./registrar-ganancia.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, EncabezadoComponent, CamposGananciaComponent]
})
export class RegistrarGananciaPage implements OnDestroy {

  private readonly gananciasService = inject(GananciasService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private temporizador?: ReturnType<typeof setTimeout>;

  /** Catálogo con los precios que el usuario definió en su perfil. */
  readonly servicios = computed(() => catalogo(this.auth.usuario()?.precios));

  readonly servicioId = signal<string | null>(null);
  readonly nombreOtro = signal('');
  readonly digitos = signal('');
  readonly propina = signal(0);
  readonly propinaLibre = signal(false);
  readonly notas = signal('');
  readonly hora = signal(horaActual());
  readonly hoy = signal(fechaISO(new Date()));
  readonly guardando = signal(false);
  readonly guardada = signal<{ monto: string; servicio: string; hora: string } | null>(null);

  readonly monto = computed(() => Number(this.digitos() || 0));
  readonly fechaTexto = computed(() => fechaCorta(this.hoy()));
  readonly puedeGuardar = computed(() =>
    this.monto() > 0 && !!this.servicioId() && !this.guardando()
  );

  /** Nombre que se guarda: el del catálogo, o el escrito para "Otro". */
  private readonly nombreServicio = computed(() => {
    const id = this.servicioId();
    if (id === 'otro') return this.nombreOtro().trim() || 'Otro';
    return this.servicios().find(s => s.id === id)?.nombre ?? '';
  });

  ionViewWillEnter(): void {
    this.hoy.set(fechaISO(new Date()));
    this.hora.set(horaActual());
  }

  escribirNotas(evento: Event): void {
    this.notas.set((evento.target as HTMLInputElement).value);
  }

  async guardar(): Promise<void> {
    if (!this.puedeGuardar()) return;

    const servicio = this.nombreServicio();
    const hora = horaActual();

    this.guardando.set(true);
    try {
      await this.gananciasService.crear({
        servicio,
        monto: this.monto(),
        propina: this.propina(),
        fecha: fechaISO(new Date()),
        hora,
        notas: this.notas().trim()
      });
    } catch (error) {
      this.toast.mostrar('No se pudo guardar: ' + (error as Error).message);
      return;
    } finally {
      this.guardando.set(false);
    }

    this.guardada.set({ monto: clp(this.monto()), servicio, hora });

    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.reiniciar();
      void this.router.navigate(['/app/inicio']);
    }, 1900);
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  private reiniciar(): void {
    this.guardada.set(null);
    this.servicioId.set(null);
    this.nombreOtro.set('');
    this.digitos.set('');
    this.propina.set(0);
    this.propinaLibre.set(false);
    this.notas.set('');
  }
}
