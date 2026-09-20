import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { GananciasService } from '../../services/ganancias.service';

@Component({
  selector: 'app-registrar-ganancia',
  templateUrl: './registrar-ganancia.page.html',
  styleUrls: ['./registrar-ganancia.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonButton,
  ],
})
export class RegistrarGananciaPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly gananciasService =
    inject(GananciasService);
  private readonly router = inject(Router);

  private readonly ahora = new Date();

  readonly formulario = this.fb.group({
    servicio: ['Corte cabello', Validators.required],

    monto: [
      22000,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],

    propina: [
      0,
      Validators.min(0),
    ],

    fecha: [
      this.ahora.toLocaleDateString('en-CA'),
      Validators.required,
    ],

    hora: [
      this.ahora.toTimeString().slice(0, 5),
      Validators.required,
    ],

    notas: [''],
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.gananciasService.crear(
      this.formulario.getRawValue()
    );

    this.router.navigate(['/app/historial']);
  }
}