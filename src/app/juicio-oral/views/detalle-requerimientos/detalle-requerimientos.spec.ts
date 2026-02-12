import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleRequerimientos } from './detalle-requerimientos';

describe('DetalleRequerimientos', () => {
  let component: DetalleRequerimientos;
  let fixture: ComponentFixture<DetalleRequerimientos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRequerimientos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleRequerimientos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
