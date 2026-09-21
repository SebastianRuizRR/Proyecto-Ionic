import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import { GananciasService } from '../../services/ganancias.service';

@Component({
  selector: 'app-editar-ganancia',
  templateUrl: './editar-ganancia.page.html',
  styleUrls: ['./editar-ganancia.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonTextarea,
    IonButton
  ]
})
export class EditarGananciaPage {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gananciasService = inject(GananciasService);

  readonly id =
    this.route.snapshot.paramMap.get('id') ?? '';

  private readonly ganancia =
    this.gananciasService.obtenerPorId(this.id);

  readonly formulario = this.fb.group({
    servicio: [
      this.ganancia?.servicio ?? '',
      Validators.required
    ],

    monto: [
      this.ganancia?.monto ?? 0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    propina: [
      this.ganancia?.propina ?? 0,
      Validators.min(0)
    ],

    fecha: [
      this.ganancia?.fecha ?? '',
      Validators.required
    ],

    hora: [
      this.ganancia?.hora ?? '',
      Validators.required
    ],

    notas: [
      this.ganancia?.notas ?? ''
    ]
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    this.gananciasService.actualizar(this.id, {
      ...datos,
      monto: Number(datos.monto),
      propina: Number(datos.propina)
    });

    this.router.navigate([
      '/app/ganancia',
      this.id
    ]);
  }
}