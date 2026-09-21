import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarGananciaPage } from './editar-ganancia.page';

describe('EditarGananciaPage', () => {
  let component: EditarGananciaPage;
  let fixture: ComponentFixture<EditarGananciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarGananciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
