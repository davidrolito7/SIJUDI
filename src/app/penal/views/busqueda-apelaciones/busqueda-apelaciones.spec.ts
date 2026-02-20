import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaApelaciones } from './busqueda-apelaciones';

describe('BusquedaApelaciones', () => {
  let component: BusquedaApelaciones;
  let fixture: ComponentFixture<BusquedaApelaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaApelaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaApelaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
