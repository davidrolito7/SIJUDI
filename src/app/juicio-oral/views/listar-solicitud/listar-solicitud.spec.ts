import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarSolicitud } from './listar-solicitud';

describe('ListarSolicitud', () => {
  let component: ListarSolicitud;
  let fixture: ComponentFixture<ListarSolicitud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarSolicitud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarSolicitud);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
