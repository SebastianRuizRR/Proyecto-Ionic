import { IonRouterOutlet, NavController } from '@ionic/angular';

/**
 * Vuelve a la pantalla anterior. Si no hay historial (por ejemplo, se
 * abrió la URL directo o se recargó la página), va a `respaldo`.
 */
export function volverAtras(
  nav: NavController,
  outlet: IonRouterOutlet | null,
  respaldo: string
): void {
  if (outlet?.canGoBack()) {
    nav.back();
  } else {
    void nav.navigateBack(respaldo);
  }
}
