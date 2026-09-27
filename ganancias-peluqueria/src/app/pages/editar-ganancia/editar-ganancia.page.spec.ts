import { ComponentFixture, TestBed } from '@angular/core/testing';

import { proveedoresDePrueba } from '../../testing/supabase-falso';
import { EditarGananciaPage } from './editar-ganancia.page';

describe('EditarGananciaPage', () => {
  let component: EditarGananciaPage;
  let fixture: ComponentFixture<EditarGananciaPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
    fixture = TestBed.createComponent(EditarGananciaPage);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
