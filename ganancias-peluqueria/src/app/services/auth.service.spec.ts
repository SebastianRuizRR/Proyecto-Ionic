import { TestBed } from '@angular/core/testing';

import { consultaFalsa, supabaseFalso } from '../testing/supabase-falso';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

describe('AuthService', () => {
  const user = {
    id: 'uid-1',
    email: 'leo@prueba.cl',
    user_metadata: { nombre: 'Leo Prueba', barberia: 'Centro' }
  };

  let cliente: ReturnType<typeof supabaseFalso>;
  let servicio: AuthService;

  beforeEach(() => {
    cliente = supabaseFalso();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { client: cliente } }]
    });
    servicio = TestBed.inject(AuthService);
  });

  it('inicia sesión, normaliza el correo y calcula las iniciales', async () => {
    cliente.auth.signInWithPassword.mockResolvedValue({ data: { user }, error: null });
    cliente.from.mockReturnValue(
      consultaFalsa({ data: { nombre: 'Leo Prueba', barberia: 'Centro' }, error: null })
    );

    await servicio.iniciarSesion('  Leo@Prueba.cl ', 'Secreta123');

    expect(cliente.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'leo@prueba.cl',
      password: 'Secreta123'
    });
    expect(servicio.autenticado()).toBe(true);
    expect(servicio.iniciales()).toBe('LP');
  });

  it('rechaza credenciales incorrectas', async () => {
    cliente.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' }
    });

    await expect(servicio.iniciarSesion('leo@prueba.cl', 'otra'))
      .rejects.toThrow('Correo o contraseña incorrectos');
    expect(servicio.autenticado()).toBe(false);
  });

  it('avisa cuando crear la cuenta requiere confirmar el correo', async () => {
    cliente.auth.signUp.mockResolvedValue({ data: { user, session: null }, error: null });

    const sesionAbierta = await servicio.crearCuenta({
      nombre: 'Leo Prueba',
      barberia: '',
      email: 'leo@prueba.cl',
      password: 'Secreta123'
    });

    expect(sesionAbierta).toBe(false);
    expect(servicio.autenticado()).toBe(false);
  });
});
