import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import { User } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';

export interface Usuario {
  nombre: string;
  barberia: string;
  email: string;
}

export interface NuevaCuenta extends Usuario {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly supabase =
    inject(SupabaseService).client;

  private readonly actual =
    signal<Usuario | null>(null);

  readonly usuario = this.actual.asReadonly();

  readonly autenticado = computed(
    () => this.actual() !== null
  );

  readonly iniciales = computed(() => {
    const usuario = this.actual();

    const nombre =
      usuario?.nombre.trim() ||
      usuario?.email.split('@')[0] ||
      '';

    const partes = nombre
      .split(/[\s._-]+/)
      .filter(Boolean);

    const primera = partes[0] ?? 'TU';

    return (
      primera[0] +
      (partes[1]?.[0] ?? primera[1] ?? '')
    ).toUpperCase();
  });

  constructor() {
    void this.restaurarSesion();

    this.supabase.auth.onAuthStateChange(
      (_evento, sesion) => {
        if (sesion?.user) {
          void this.cargarUsuario(sesion.user);
        } else {
          this.actual.set(null);
        }
      }
    );
  }

  async iniciarSesion(
    email: string,
    password: string
  ): Promise<void> {

    const { data, error } =
      await this.supabase.auth.signInWithPassword({
        email: this.normalizar(email),
        password
      });

    if (error) {
      throw new Error(
        'Correo o contraseña incorrectos'
      );
    }

    await this.cargarUsuario(data.user);
  }

  async crearCuenta(
    datos: NuevaCuenta
  ): Promise<void> {

    const { data, error } =
      await this.supabase.auth.signUp({
        email: this.normalizar(datos.email),
        password: datos.password,

        options: {
          data: {
            nombre: datos.nombre.trim(),
            barberia: datos.barberia.trim()
          }
        }
      });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session && data.user) {
      await this.cargarUsuario(data.user);
    }
  }

  async recuperarContrasena(
    email: string
  ): Promise<void> {

    const { error } =
      await this.supabase.auth.resetPasswordForEmail(
        this.normalizar(email)
      );

    if (error) {
      throw new Error(error.message);
    }
  }

  async cerrarSesion(): Promise<void> {
    const { error } =
      await this.supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    this.actual.set(null);
  }

  private async restaurarSesion(): Promise<void> {
    const { data } =
      await this.supabase.auth.getSession();

    if (data.session?.user) {
      await this.cargarUsuario(
        data.session.user
      );
    }
  }

  private async cargarUsuario(
    user: User
  ): Promise<void> {

    const { data } = await this.supabase
      .from('profiles')
      .select('nombre, barberia')
      .eq('id', user.id)
      .maybeSingle();

    this.actual.set({
      nombre:
        data?.nombre ??
        user.user_metadata?.['nombre'] ??
        '',

      barberia:
        data?.barberia ??
        user.user_metadata?.['barberia'] ??
        '',

      email: user.email ?? ''
    });
  }

  private normalizar(email: string): string {
    return email.trim().toLowerCase();
  }
}