import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { TemaService } from '../../services/tema.service';

@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.scss'],
  standalone: true
})
export class EncabezadoComponent {

  readonly antetitulo = input.required<string>();
  readonly titulo = input.required<string>();

  readonly tema = inject(TemaService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
