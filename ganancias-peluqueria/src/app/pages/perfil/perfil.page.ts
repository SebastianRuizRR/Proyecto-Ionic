import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular';

import { CabeceraSecundariaComponent } from '../../components/cabecera-secundaria/cabecera-secundaria.component';
import { IconoServicioComponent } from '../../components/icono-servicio/icono-servicio.component';
import { catalogo } from '../../models/servicio.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

const MAX_DIGITOS_PRECIO = 7;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, CabeceraSecundariaComponent, IconoServicioComponent]
})
export class PerfilPage {

  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly nombre = computed(() => this.auth.usuario()?.nombre || 'Sin nombre');
  readonly barberia = computed(() => this.auth.usuario()?.barberia || 'Sin barbería');
  readonly email = computed(() => this.auth.usuario()?.email ?? '');

  /** Servicios con precio (todos menos "Otro"), con los precios del usuario. */
  readonly servicios = computed(() =>
    catalogo(this.auth.usuario()?.precios)
      .filter(s => s.id !== 'otro')
      .map(s => ({ ...s, precioTexto: s.precio ? s.precio.toLocaleString('es-CL') : '' }))
  );

  readonly editando = signal(false);
  readonly eNombre = signal('');
  readonly eBarberia = signal('');
  readonly guardando = signal(false);
  readonly saliendo = signal(false);

  empezarEdicion(): void {
    const usuario = this.auth.usuario();
    this.eNombre.set(usuario?.nombre ?? '');
    this.eBarberia.set(usuario?.barberia ?? '');
    this.editando.set(true);
  }

  escribir(campo: 'eNombre' | 'eBarberia', evento: Event): void {
    this[campo].set((evento.target as HTMLInputElement).value);
  }

  async guardarPerfil(): Promise<void> {
    if (this.guardando()) return;

    this.guardando.set(true);
    try {
      await this.auth.actualizarPerfil({
        nombre: this.eNombre(),
        barberia: this.eBarberia()
      });
      this.editando.set(false);
      this.toast.mostrar('Perfil actualizado');
    } catch (error) {
      this.toast.mostrar((error as Error).message);
    } finally {
      this.guardando.set(false);
    }
  }

  async cambiarPrecio(id: string, evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const precio = Number(campo.value.replace(/\D/g, '').slice(0, MAX_DIGITOS_PRECIO)) || 0;
    const actual = this.servicios().find(s => s.id === id)?.precio;

    campo.value = precio ? precio.toLocaleString('es-CL') : '';
    if (precio === actual) return;

    try {
      await this.auth.guardarPrecios({
        ...this.auth.usuario()?.precios,
        [id]: precio
      });
      this.toast.mostrar('Precio actualizado');
    } catch (error) {
      this.toast.mostrar('No se pudo guardar el precio: ' + (error as Error).message);
    }
  }

  async cerrarSesion(): Promise<void> {
    if (this.saliendo()) return;

    this.saliendo.set(true);
    try {
      await this.auth.cerrarSesion();
      await this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      this.toast.mostrar('No se pudo cerrar sesión: ' + (error as Error).message);
    } finally {
      this.saliendo.set(false);
    }
  }
}
