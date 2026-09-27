import { Component, inject, input } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';

import { volverAtras } from '../../utils/navegacion';

/** Encabezado con botón "volver" de Perfil, Detalle y Editar. */
@Component({
  selector: 'app-cabecera-secundaria',
  standalone: true,
  template: `
    <div class="cabecera">
      <button type="button" class="volver" aria-label="Volver" (click)="volver()">
        <span class="volver__flecha"></span>
      </button>
      <div class="textos">
        <span class="antetitulo">{{ antetitulo() }}</span>
        <h1 class="titulo">{{ titulo() }}</h1>
      </div>
    </div>
  `,
  styles: `
    .cabecera {
      padding: calc(var(--ion-safe-area-top, 0px) + 20px) 20px 12px;
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--bg);
    }

    .volver {
      flex: none;
      width: 42px;
      height: 42px;
      border-radius: 21px;
      border: 1px solid var(--line);
      background: var(--surf);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;

      &:hover {
        border-color: var(--acc);
      }
    }

    .volver__flecha {
      width: 10px;
      height: 10px;
      border-left: 2.5px solid var(--ink);
      border-bottom: 2.5px solid var(--ink);
      transform: translateX(2px) rotate(45deg);
    }

    .textos {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .antetitulo {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink3);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .titulo {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.1;
      color: var(--ink);
    }
  `
})
export class CabeceraSecundariaComponent {

  readonly antetitulo = input.required<string>();
  readonly titulo = input.required<string>();
  /** A dónde ir si no hay pantalla anterior (por ejemplo, tras recargar). */
  readonly respaldo = input('/app/inicio');

  private readonly nav = inject(NavController);
  private readonly outlet = inject(IonRouterOutlet, { optional: true });

  volver(): void {
    volverAtras(this.nav, this.outlet, this.respaldo());
  }
}
