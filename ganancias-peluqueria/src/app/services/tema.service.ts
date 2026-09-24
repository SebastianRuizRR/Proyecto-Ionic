import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemaService {

  private readonly clave = 'tema';

  readonly oscuro = signal(this.cargar());

  constructor() {
    effect(() => {
      const oscuro = this.oscuro();
      document.documentElement.classList.toggle('ion-palette-dark', oscuro);
      localStorage.setItem(this.clave, oscuro ? 'oscuro' : 'claro');
    });
  }

  alternar(): void {
    this.oscuro.update(oscuro => !oscuro);
  }

  private cargar(): boolean {
    const guardado = localStorage.getItem(this.clave);
    if (guardado) return guardado === 'oscuro';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
