import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleBusqueda } from './detalle-busqueda';

describe('DetalleBusqueda', () => {
  let component: DetalleBusqueda;
  let fixture: ComponentFixture<DetalleBusqueda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleBusqueda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleBusqueda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
