import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  const cuenta = {
    nombre: 'Leo Prueba',
    barberia: 'Barbería Centro',
    email: 'Leo@Prueba.cl',
    password: 'Secreta123'
  };

  let servicio: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servicio = TestBed.inject(AuthService);
  });

  it('crea la cuenta, abre la sesión y calcula las iniciales', async () => {
    await servicio.crearCuenta(cuenta);

    expect(servicio.autenticado()).toBe(true);
    expect(servicio.usuario()?.email).toBe('leo@prueba.cl');
    expect(servicio.iniciales()).toBe('LP');
    expect(localStorage.getItem('cuentas')).not.toContain(cuenta.password);
  });

  it('no permite dos cuentas con el mismo correo', async () => {
    await servicio.crearCuenta(cuenta);

    await expect(
      servicio.crearCuenta({ ...cuenta, email: ' leo@prueba.cl ' })
    ).rejects.toThrow('Ya existe una cuenta con ese correo');
  });

  it('inicia sesión solo con la contraseña correcta', async () => {
    await servicio.crearCuenta(cuenta);
    servicio.cerrarSesion();
    expect(servicio.autenticado()).toBe(false);

    await expect(
      servicio.iniciarSesion(cuenta.email, 'otra-clave')
    ).rejects.toThrow('Correo o contraseña incorrectos');
    expect(servicio.autenticado()).toBe(false);

    await servicio.iniciarSesion('leo@prueba.cl', cuenta.password);
    expect(servicio.autenticado()).toBe(true);
  });
});
