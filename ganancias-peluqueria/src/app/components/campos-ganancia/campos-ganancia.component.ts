import { Component, computed, input, model } from '@angular/core';

import { Servicio } from '../../models/servicio.model';
import { clp } from '../../utils/formato';
import { IconoServicioComponent } from '../icono-servicio/icono-servicio.component';

const BORRAR = '⌫';
const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', BORRAR];
const MAX_DIGITOS = 8;
const MAX_DIGITOS_PROPINA = 7;

/**
 * Servicio, monto (con teclado) y propina. Lo comparten Registrar y Editar.
 * Los valores se enlazan en ambos sentidos con [(...)], así la página
 * padre es dueña del estado y puede reiniciarlo o precargarlo.
 */
@Component({
  selector: 'app-campos-ganancia',
  templateUrl: './campos-ganancia.component.html',
  styleUrls: ['./campos-ganancia.component.scss'],
  standalone: true,
  imports: [IconoServicioComponent]
})
export class CamposGananciaComponent {

  readonly servicios = input.required<Servicio[]>();
  readonly propinas = input<number[]>([0, 1000, 2000, 5000]);
  /** En Editar, elegir "Otro" no borra el monto ya ingresado. */
  readonly conservarMonto = input(false);

  readonly servicioId = model<string | null>(null);
  readonly nombreOtro = model('');
  readonly digitos = model('');
  readonly propina = model(0);
  readonly propinaLibre = model(false);

  readonly teclas = TECLAS;
  readonly borrar = BORRAR;

  readonly opciones = computed(() =>
    this.servicios().map(s => ({
      ...s,
      detalle: s.precio ? clp(s.precio) : ''
    }))
  );

  readonly opcionesPropina = computed(() =>
    this.propinas().map(valor => ({
      valor,
      texto: valor ? '+' + valor.toLocaleString('es-CL') : 'Sin propina'
    }))
  );

  readonly monto = computed(() => Number(this.digitos() || 0));
  readonly montoTexto = computed(() => clp(this.monto()));
  readonly esOtro = computed(() => this.servicioId() === 'otro');
  readonly propinaLibreTexto = computed(() =>
    this.propina() ? this.propina().toLocaleString('es-CL') : ''
  );

  elegirServicio(servicio: Servicio): void {
    this.servicioId.set(servicio.id);
    if (servicio.precio) {
      this.digitos.set(String(servicio.precio));
    } else if (!this.conservarMonto()) {
      this.digitos.set('');
    }
  }

  escribirNombreOtro(evento: Event): void {
    this.nombreOtro.set((evento.target as HTMLInputElement).value);
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

  elegirPropina(valor: number): void {
    this.propinaLibre.set(false);
    this.propina.set(valor);
  }

  activarPropinaLibre(): void {
    this.propinaLibre.set(true);
    this.propina.set(0);
  }

  escribirPropina(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const digitos = campo.value.replace(/\D/g, '').slice(0, MAX_DIGITOS_PROPINA);
    this.propina.set(Number(digitos || 0));
    // Reescribe el campo con separador de miles mientras se escribe.
    campo.value = this.propinaLibreTexto();
  }
}
