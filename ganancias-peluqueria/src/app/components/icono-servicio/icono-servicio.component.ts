import { Component, computed, input } from '@angular/core';

import { ICONOS_SERVICIO, inicialServicio, servicioId } from '../../models/servicio.model';

/**
 * Ícono de un servicio del catálogo. Para servicios con nombre personalizado
 * muestra su inicial. Toma el color del texto (currentColor).
 */
@Component({
  selector: 'app-icono-servicio',
  standalone: true,
  template: `
    @if (mascara(); as url) {
      <span class="icono" [style]="{ 'mask-image': url, '-webkit-mask-image': url }"></span>
    } @else {
      <span class="inicial">{{ inicial() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--tamano, 20px);
      height: var(--tamano, 20px);
    }

    .icono {
      width: 100%;
      height: 100%;
      background: currentColor;
      mask-size: contain;
      mask-position: center;
      mask-repeat: no-repeat;
      -webkit-mask-size: contain;
      -webkit-mask-position: center;
      -webkit-mask-repeat: no-repeat;
    }

    .inicial {
      font-family: var(--fuente-serif);
      font-size: calc(var(--tamano, 20px) * 0.95);
      line-height: 1;
    }
  `
})
export class IconoServicioComponent {

  /** Nombre del servicio tal como se guarda ("Corte cabello", "Tinte"...). */
  readonly nombre = input.required<string>();

  private readonly id = computed(() => servicioId(this.nombre()));

  readonly mascara = computed(() => {
    const svg = ICONOS_SERVICIO[this.id()];
    return svg ? `url("data:image/svg+xml,${encodeURIComponent(svg)}")` : null;
  });

  readonly inicial = computed(() => inicialServicio(this.nombre()));
}
