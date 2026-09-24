import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';
import { emailValido } from '../../utils/validacion';

interface Errores {
  email?: string;
  password?: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, RouterLink],
})
export class LoginPage {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly mostrarPassword = signal(false);
  readonly errores = signal<Errores>({});
  readonly info = signal('');
  readonly cargando = signal(false);

  escribir(campo: 'email' | 'password', evento: Event): void {
    this[campo].set((evento.target as HTMLInputElement).value);
    this.errores.update(e => ({ ...e, [campo]: '' }));
    this.info.set('');
  }

  async recuperar(): Promise<void> {
    if (!emailValido(this.email())) {
      this.errores.set({ email: 'Escribe tu correo para recuperar la contraseña' });
      this.info.set('');
      return;
    }
    await this.auth.recuperarContrasena(this.email());
    this.errores.set({});
    this.info.set('Te enviamos un enlace a ' + this.email().trim());
  }

  async entrar(evento: Event): Promise<void> {
    evento.preventDefault();
    if (this.cargando()) return;

    const errores: Errores = {};
    if (!emailValido(this.email())) errores.email = 'Ingresa un correo válido';
    if (this.password().length < 6) errores.password = 'La contraseña debe tener al menos 6 caracteres';
    this.errores.set(errores);
    this.info.set('');
    if (Object.keys(errores).length) return;

    this.cargando.set(true);
    try {
      await this.auth.iniciarSesion(this.email(), this.password());
      this.password.set('');
      this.mostrarPassword.set(false);
      this.router.navigate(['/app/inicio'], { replaceUrl: true });
    } catch (error) {
      this.errores.set({ password: (error as Error).message });
    } finally {
      this.cargando.set(false);
    }
  }
}
