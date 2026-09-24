import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular';

import { EncabezadoComponent } from '../../components/encabezado/encabezado.component';
import { SERVICIOS, Servicio } from '../../models/servicio.model';
import { GananciasService } from '../../services/ganancias.service';
import { clp, fechaCorta, fechaISO, horaActual } from '../../utils/formato';

const BORRAR = '⌫';
const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', BORRAR];
const PROPINAS = [0, 1000, 2000, 5000];
const MAX_DIGITOS = 8;

@Component({
  selector: 'app-registrar-ganancia',
  templateUrl: './registrar-ganancia.page.html',
  styleUrls: ['./registrar-ganancia.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, EncabezadoComponent]
})
export class RegistrarGananciaPage implements OnDestroy {

  private readonly gananciasService = inject(GananciasService);
  private readonly router = inject(Router);
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly servicios = SERVICIOS.map(s => ({
    ...s,
    detalle: s.precio ? clp(s.precio) : 'Monto libre'
  }));
  readonly teclas = TECLAS;
  readonly borrar = BORRAR;
  readonly propinas = PROPINAS.map(valor => ({
    valor,
    texto: valor ? '+' + valor.toLocaleString('es-CL') : 'Sin propina'
  }));

  readonly servicio = signal<Servicio | null>(null);
  readonly digitos = signal('');
  readonly propina = signal(0);
  readonly notas = signal('');
  readonly hora = signal(horaActual());
  readonly hoy = signal(fechaISO(new Date()));
  readonly guardada = signal<{ monto: string; servicio: string; hora: string } | null>(null);

  readonly monto = computed(() => Number(this.digitos() || 0));
  readonly montoTexto = computed(() => clp(this.monto()));
  readonly fechaTexto = computed(() => fechaCorta(this.hoy()));
  readonly puedeGuardar = computed(() => this.monto() > 0 && !!this.servicio());

  ionViewWillEnter(): void {
    this.hoy.set(fechaISO(new Date()));
    this.hora.set(horaActual());
  }

  elegirServicio(servicio: Servicio): void {
    this.servicio.set(servicio);
    this.digitos.set(servicio.precio ? String(servicio.precio) : '');
  }

  presionar(tecla: string): void {
    if (tecla === BORRAR) {
      this.digitos.update(d => d.slice(0, -1));
      return;
    }
    if (this.digitos().length >= MAX_DIGITOS) return;
    this.digitos.update(d => (d + tecla).replace(/^0+(?=\d)/, ''));
  }

  limpiar(): void {
    this.digitos.set('');
  }

  escribirNotas(evento: Event): void {
    this.notas.set((evento.target as HTMLInputElement).value);
  }

  guardar(): void {
    const servicio = this.servicio();
    if (!this.puedeGuardar() || !servicio) return;

    const hora = horaActual();
    this.gananciasService.crear({
      servicio: servicio.nombre,
      monto: this.monto(),
      propina: this.propina(),
      fecha: fechaISO(new Date()),
      hora,
      notas: this.notas().trim()
    });

    this.guardada.set({ monto: this.montoTexto(), servicio: servicio.nombre, hora });

    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.reiniciar();
      this.router.navigate(['/app/inicio']);
    }, 1900);
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  private reiniciar(): void {
    this.guardada.set(null);
    this.servicio.set(null);
    this.digitos.set('');
    this.propina.set(0);
    this.notas.set('');
  }
}
