import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntregaRecepcion } from './entrega-recepcion';

describe('EntregaRecepcion', () => {
  let component: EntregaRecepcion;
  let fixture: ComponentFixture<EntregaRecepcion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntregaRecepcion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntregaRecepcion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
