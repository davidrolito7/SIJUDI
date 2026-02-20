import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarAmparosRecibidos } from './listar-amparos-recibidos';

describe('Listar', () => {
  let component: ListarAmparosRecibidos;
  let fixture: ComponentFixture<ListarAmparosRecibidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarAmparosRecibidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarAmparosRecibidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
