import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaExhortoEnviados } from './lista-exhorto-enviado';

describe('Listar', () => {
  let component: ListaExhortoEnviados;
  let fixture: ComponentFixture<ListaExhortoEnviados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaExhortoEnviados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaExhortoEnviados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
