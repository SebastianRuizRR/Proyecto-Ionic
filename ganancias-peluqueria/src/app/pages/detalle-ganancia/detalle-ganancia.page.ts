import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import { GananciasService } from '../../services/ganancias.service';

@Component({
  selector: 'app-detalle-ganancia',
  templateUrl: './detalle-ganancia.page.html',
  styleUrls: ['./detalle-ganancia.page.scss'],
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton
  ]
})
export class DetalleGananciaPage {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly gananciasService = inject(GananciasService);

  private readonly id =
    this.route.snapshot.paramMap.get('id') ?? '';

  readonly ganancia = computed(() =>
    this.gananciasService.obtenerPorId(this.id)
  );


  //ALERTA CONFIRMACION
  
  async eliminar(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Eliminar ganancia',
      message: '¿Estás seguro de eliminar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.gananciasService.eliminar(this.id);
            this.router.navigate(['/app/historial']);
          }
        }
      ]
    });

    await alerta.present();
  }
}