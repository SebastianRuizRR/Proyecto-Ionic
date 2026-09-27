import { Routes } from '@angular/router';

import { conSesionGuard, sinSesionGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [sinSesionGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'crear-cuenta',
    canActivate: [sinSesionGuard],
    loadComponent: () =>
      import('./pages/crear-cuenta/crear-cuenta.page').then(
        (m) => m.CrearCuentaPage
      ),
  },
  {
    path: 'app',
    canActivate: [conSesionGuard],
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'registrar',
        loadComponent: () =>
          import(
            './pages/registrar-ganancia/registrar-ganancia.page'
          ).then((m) => m.RegistrarGananciaPage),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./pages/historial/historial.page').then(
            (m) => m.HistorialPage
          ),
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./pages/estadisticas/estadisticas.page').then(
            (m) => m.EstadisticasPage
          ),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  // Pantallas completas (sin barra de pestañas), como en el diseño.
  {
    path: 'perfil',
    canActivate: [conSesionGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
  },
  {
    path: 'ganancia/:id/editar',
    canActivate: [conSesionGuard],
    loadComponent: () =>
      import(
        './pages/editar-ganancia/editar-ganancia.page'
      ).then((m) => m.EditarGananciaPage),
  },
  {
    path: 'ganancia/:id',
    canActivate: [conSesionGuard],
    loadComponent: () =>
      import(
        './pages/detalle-ganancia/detalle-ganancia.page'
      ).then((m) => m.DetalleGananciaPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];