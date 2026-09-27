import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

// Los guards esperan a que Supabase recupere la sesión guardada; si no,
// al recargar la página se vería como "sin sesión" por un instante.

/** Solo deja entrar a la app con una sesión iniciada. */
export const conSesionGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarSesion();
  return auth.autenticado() || router.createUrlTree(['/login']);
};

/** Evita volver al login o al registro si ya hay una sesión iniciada. */
export const sinSesionGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarSesion();
  return !auth.autenticado() || router.createUrlTree(['/app/inicio']);
};
