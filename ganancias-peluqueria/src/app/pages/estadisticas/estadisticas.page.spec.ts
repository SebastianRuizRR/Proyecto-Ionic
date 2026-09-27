import { ComponentFixture, TestBed } from '@angular/core/testing';

import { proveedoresDePrueba } from '../../testing/supabase-falso';
import { EstadisticasPage } from './estadisticas.page';

describe('EstadisticasPage', () => {
  let component: EstadisticasPage;
  let fixture: ComponentFixture<EstadisticasPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
    fixture = TestBed.createComponent(EstadisticasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
