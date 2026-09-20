import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-detalle-ganancia',
  templateUrl: './detalle-ganancia.page.html',
  styleUrls: ['./detalle-ganancia.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DetalleGananciaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
