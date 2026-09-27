import { ComponentFixture, TestBed } from '@angular/core/testing';

import { proveedoresDePrueba } from '../../testing/supabase-falso';
import { DetalleGananciaPage } from './detalle-ganancia.page';

describe('DetalleGananciaPage', () => {
  let component: DetalleGananciaPage;
  let fixture: ComponentFixture<DetalleGananciaPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
    fixture = TestBed.createComponent(DetalleGananciaPage);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
