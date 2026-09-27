import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { ToastComponent } from './components/toast/toast.component';
import { TemaService } from './services/tema.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, ToastComponent],
})
export class AppComponent {
  // Se inyecta aquí para aplicar el tema guardado apenas arranca la app.
  private readonly tema = inject(TemaService);
}
