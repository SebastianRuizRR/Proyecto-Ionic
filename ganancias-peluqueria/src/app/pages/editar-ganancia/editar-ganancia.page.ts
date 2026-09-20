import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-editar-ganancia',
  templateUrl: './editar-ganancia.page.html',
  styleUrls: ['./editar-ganancia.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EditarGananciaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
