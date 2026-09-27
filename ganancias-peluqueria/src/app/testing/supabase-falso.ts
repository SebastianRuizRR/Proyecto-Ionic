import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';

import { SupabaseService } from '../services/supabase.service';

// Solo para tests: reemplaza el cliente de Supabase para que ningún spec
// haga llamadas reales a la base de datos ni cree cuentas.

interface Resultado {
  data: unknown;
  error: { message: string } | null;
}

/** Consulta encadenable (from().select().eq()...) que responde `resultado`. */
export function consultaFalsa(resultado: Resultado = { data: [], error: null }) {
  const consulta: Record<string, unknown> = {};
  for (const metodo of ['select', 'eq', 'order', 'insert', 'update', 'delete']) {
    consulta[metodo] = () => consulta;
  }
  consulta['single'] = () => Promise.resolve(resultado);
  consulta['maybeSingle'] = () => Promise.resolve(resultado);
  consulta['then'] = (ok: (r: Resultado) => unknown, error: (e: unknown) => unknown) =>
    Promise.resolve(resultado).then(ok, error);
  return consulta;
}

export function supabaseFalso() {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn()
    },
    from: vi.fn(() => consultaFalsa())
  };
}

/** Providers comunes para los specs de páginas y componentes. */
export function proveedoresDePrueba(
  cliente = supabaseFalso()
): (Provider | EnvironmentProviders)[] {
  return [
    provideRouter([]),
    provideIonicAngular(),
    { provide: SupabaseService, useValue: { client: cliente } }
  ];
}
