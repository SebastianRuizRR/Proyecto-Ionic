import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import { AuthError, User } from '@supabase/supabase-js';

import { Precios } from '../models/servicio.model';
import { SupabaseService } from './supabase.service';

export interface Usuario {
  nombre: string;
  barberia: string;
  email: string;
  precios?: Precios;
}

/** Lo que se puede editar del perfil. El correo no se cambia desde la app. */
export interface DatosPerfil {
  nombre: string;
  barberia: string;
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

  // Se resuelve cuando termina de revisar si había una sesión guardada.
  // Los guards la esperan para no mandar al login al recargar la página.
  private readonly sesionRestaurada: Promise<void>;

  constructor() {
    this.sesionRestaurada = this.restaurarSesion();

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

  esperarSesion(): Promise<void> {
    return this.sesionRestaurada;
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

  /** Devuelve false si Supabase pide confirmar el correo antes de entrar. */
  async crearCuenta(
    datos: NuevaCuenta
  ): Promise<boolean> {

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
      throw new Error(this.traducir(error));
    }

    if (data.session && data.user) {
      await this.cargarUsuario(data.user);
      return true;
    }

    return false;
  }

  async recuperarContrasena(
    email: string
  ): Promise<void> {

    const { error } =
      await this.supabase.auth.resetPasswordForEmail(
        this.normalizar(email)
      );

    if (error) {
      throw new Error(this.traducir(error));
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

  /** Actualiza nombre y barbería en la metadata de Auth y en la tabla profiles. */
  async actualizarPerfil(
    datos: DatosPerfil
  ): Promise<void> {

    const { data: usuarioData, error: usuarioError } =
      await this.supabase.auth.getUser();

    if (usuarioError || !usuarioData.user) {
      throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
    }

    const user = usuarioData.user;
    const nombre = datos.nombre.trim();
    const barberia = datos.barberia.trim();

    const { data: actualizado, error: errorAuth } =
      await this.supabase.auth.updateUser({
        data: { nombre, barberia }
      });

    if (errorAuth) {
      throw new Error(this.traducir(errorAuth));
    }

    const { data: filas, error } = await this.supabase
      .from('profiles')
      .update({ nombre, barberia })
      .eq('id', user.id)
      .select('id');

    if (error) {
      throw new Error(error.message);
    }

    if (!filas?.length) {
      throw new Error(
        'No se pudo guardar el perfil. Revisa los permisos de la tabla profiles.'
      );
    }

    await this.cargarUsuario(actualizado.user);
  }

  /** Guarda los precios sugeridos del usuario en su metadata de Supabase. */
  async guardarPrecios(
    precios: Precios
  ): Promise<void> {

    const { data, error } =
      await this.supabase.auth.updateUser({
        data: { precios }
      });

    if (error) {
      throw new Error(this.traducir(error));
    }

    await this.cargarUsuario(data.user);
  }

  private async restaurarSesion(): Promise<void> {
    try {
      const { data } =
        await this.supabase.auth.getSession();

      if (data.session?.user) {
        await this.cargarUsuario(
          data.session.user
        );
      }
    } catch {
      // Sin conexión: se sigue sin sesión y el guard manda al login.
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

      email: user.email ?? '',

      precios: user.user_metadata?.['precios']
    });
  }

  private normalizar(email: string): string {
    return email.trim().toLowerCase();
  }

  /** Mensajes de Supabase Auth en español y con qué hacer. */
  private traducir(error: AuthError): string {
    switch (error.code) {
      case 'email_address_invalid':
        return 'Supabase rechazó ese correo. Usa una dirección real a la que tengas acceso.';
      case 'email_address_not_authorized':
        return 'Este proyecto de Supabase solo puede enviar correos a los miembros del equipo. Configura un SMTP propio para otros correos.';
      case 'email_exists':
      case 'user_already_exists':
        return 'Ya existe una cuenta con ese correo.';
      case 'weak_password':
        return 'La contraseña es muy débil. Usa al menos 8 caracteres, con letras y números.';
      case 'over_email_send_rate_limit':
        return 'Se enviaron demasiados correos. Espera unos minutos y vuelve a intentar.';
      default:
        return error.message;
    }
  }
}