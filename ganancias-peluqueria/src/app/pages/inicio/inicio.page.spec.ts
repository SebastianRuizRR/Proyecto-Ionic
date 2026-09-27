import { ComponentFixture, TestBed } from '@angular/core/testing';

import { proveedoresDePrueba } from '../../testing/supabase-falso';
import { InicioPage } from './inicio.page';

describe('InicioPage', () => {
  let component: InicioPage;
  let fixture: ComponentFixture<InicioPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
    fixture = TestBed.createComponent(InicioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
