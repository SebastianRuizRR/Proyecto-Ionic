import { Injectable, computed, signal } from '@angular/core';

export interface Usuario {
  nombre: string;
  barberia: string;
  email: string;
}

export interface NuevaCuenta extends Usuario {
  password: string;
}

interface CuentaGuardada extends Usuario {
  passwordHash: string;
}

// SESIÓN LOCAL (provisoria)
// Las cuentas se guardan en este dispositivo, con la contraseña hasheada.
// Cuando se integre Supabase, solo hay que reemplazar el cuerpo de
// iniciarSesion, crearCuenta, recuperarContrasena y cerrarSesion por las
// llamadas a supabase.auth; las páginas y los guards no cambian.

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly claveCuentas = 'cuentas';
  private readonly claveSesion = 'sesion';

  private readonly actual = signal<Usuario | null>(this.cargarSesion());

  readonly usuario = this.actual.asReadonly();
  readonly autenticado = computed(() => this.actual() !== null);

  readonly iniciales = computed(() => {
    const usuario = this.actual();
    const nombre = usuario?.nombre.trim() || usuario?.email.split('@')[0] || '';
    const partes = nombre.split(/[\s._-]+/).filter(Boolean);
    const primera = partes[0] ?? 'TU';
    return (primera[0] + (partes[1]?.[0] ?? primera[1] ?? '')).toUpperCase();
  });

  async iniciarSesion(email: string, password: string): Promise<void> {
    const cuenta = this.cargarCuentas().find(c => c.email === this.normalizar(email));

    if (!cuenta || cuenta.passwordHash !== await this.hash(password)) {
      throw new Error('Correo o contraseña incorrectos');
    }

    this.abrirSesion(cuenta);
  }

  async crearCuenta(datos: NuevaCuenta): Promise<void> {
    const email = this.normalizar(datos.email);
    const cuentas = this.cargarCuentas();

    if (cuentas.some(c => c.email === email)) {
      throw new Error('Ya existe una cuenta con ese correo');
    }

    const cuenta: CuentaGuardada = {
      nombre: datos.nombre.trim(),
      barberia: datos.barberia.trim(),
      email,
      passwordHash: await this.hash(datos.password)
    };

    localStorage.setItem(this.claveCuentas, JSON.stringify([...cuentas, cuenta]));
    this.abrirSesion(cuenta);
  }

  /** Sin backend no se puede enviar el correo; con Supabase será resetPasswordForEmail. */
  async recuperarContrasena(email: string): Promise<void> {
    void email;
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.claveSesion);
    this.actual.set(null);
  }

  private abrirSesion(cuenta: CuentaGuardada): void {
    const usuario: Usuario = {
      nombre: cuenta.nombre,
      barberia: cuenta.barberia,
      email: cuenta.email
    };
    localStorage.setItem(this.claveSesion, JSON.stringify(usuario));
    this.actual.set(usuario);
  }

  private normalizar(email: string): string {
    return email.trim().toLowerCase();
  }

  private async hash(texto: string): Promise<string> {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
  }

  private cargarCuentas(): CuentaGuardada[] {
    try {
      return JSON.parse(localStorage.getItem(this.claveCuentas) ?? '[]');
    } catch {
      return [];
    }
  }

  private cargarSesion(): Usuario | null {
    try {
      return JSON.parse(localStorage.getItem(this.claveSesion) ?? 'null');
    } catch {
      return null;
    }
  }
}
