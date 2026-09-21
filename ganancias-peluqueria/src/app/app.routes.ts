import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'crear-cuenta',
    loadComponent: () =>
      import('./pages/crear-cuenta/crear-cuenta.page').then(
        (m) => m.CrearCuentaPage
      ),
  },
  {
    path: 'app',
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
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: 'ganancia/:id/editar',
        loadComponent: () =>
          import(
            './pages/editar-ganancia/editar-ganancia.page'
          ).then((m) => m.EditarGananciaPage),
      },
      {
        path: 'ganancia/:id',
        loadComponent: () =>
          import(
            './pages/detalle-ganancia/detalle-ganancia.page'
          ).then((m) => m.DetalleGananciaPage),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
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