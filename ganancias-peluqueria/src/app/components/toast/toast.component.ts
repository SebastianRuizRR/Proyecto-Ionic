import { Component, inject } from '@angular/core';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (toast.mensaje(); as mensaje) {
      <div class="toast" role="status">
        <span class="toast__punto"></span>
        <span>{{ mensaje }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed;
      left: 20px;
      right: 20px;
      bottom: calc(var(--ion-safe-area-bottom, 0px) + 96px);
      z-index: 30000;
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .toast {
      padding: 12px 18px;
      border-radius: 14px;
      background: var(--ink);
      color: var(--bg);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.4);
      animation: rise 0.25s ease-out both;
    }

    .toast__punto {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: var(--acc);
    }
  `
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
