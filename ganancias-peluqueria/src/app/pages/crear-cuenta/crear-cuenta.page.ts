import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';
import { emailValido, seguridadPassword } from '../../utils/validacion';

type Campo = 'nombre' | 'barberia' | 'email' | 'password';

interface Errores {
  nombre?: string;
  email?: string;
  password?: string;
  terminos?: boolean;
}

const ETIQUETAS_SEGURIDAD = ['', 'Débil', 'Media', 'Fuerte'];
const COLORES_SEGURIDAD = ['var(--line)', 'var(--err)', 'var(--acc)', 'var(--ok)'];

@Component({
  selector: 'app-crear-cuenta',
  templateUrl: './crear-cuenta.page.html',
  styleUrls: ['./crear-cuenta.page.scss'],
  standalone: true,
  imports: [IonContent, RouterLink]
})
export class CrearCuentaPage {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly nombre = signal('');
  readonly barberia = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly terminos = signal(false);
  readonly mostrarPassword = signal(false);
  readonly errores = signal<Errores>({});
  readonly cargando = signal(false);

  private readonly seguridad = computed(() => seguridadPassword(this.password()));
  readonly etiquetaSeguridad = computed(() => ETIQUETAS_SEGURIDAD[this.seguridad()]);
  readonly barrasSeguridad = computed(() =>
    [1, 2, 3].map(i =>
      i <= this.seguridad() ? COLORES_SEGURIDAD[this.seguridad()] : 'var(--line)'
    )
  );

  escribir(campo: Campo, evento: Event): void {
    this[campo].set((evento.target as HTMLInputElement).value);
    this.errores.update(e => ({ ...e, [campo]: '' }));
  }

  alternarTerminos(): void {
    this.terminos.update(t => !t);
    this.errores.update(e => ({ ...e, terminos: false }));
  }

  async crear(evento: Event): Promise<void> {
    evento.preventDefault();
    if (this.cargando()) return;

    const errores: Errores = {};
    if (this.nombre().trim().length < 2) errores.nombre = 'Escribe tu nombre';
    if (!emailValido(this.email())) errores.email = 'Ingresa un correo válido';
    if (this.password().length < 8) errores.password = 'Usa al menos 8 caracteres';
    if (Object.keys(errores).length === 0 && !this.terminos()) errores.terminos = true;
    this.errores.set(errores);
    if (Object.keys(errores).length) return;

    this.cargando.set(true);
    try {
      await this.auth.crearCuenta({
        nombre: this.nombre(),
        barberia: this.barberia(),
        email: this.email(),
        password: this.password()
      });
      this.router.navigate(['/app/inicio'], { replaceUrl: true });
    } catch (error) {
      this.errores.set({ email: (error as Error).message });
    } finally {
      this.cargando.set(false);
    }
  }
}
