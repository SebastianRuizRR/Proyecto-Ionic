import { Injectable, signal } from '@angular/core';

/** Aviso breve en la parte inferior ("Cambios guardados", "Registro eliminado"...). */
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private readonly duracion = 1900;
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly mensaje = signal('');

  mostrar(mensaje: string): void {
    this.mensaje.set(mensaje);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.mensaje.set(''), this.duracion);
  }
}
