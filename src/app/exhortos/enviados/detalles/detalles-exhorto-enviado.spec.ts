import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesExhortoEnviado } from './detalles-exhorto-enviado';

describe('Detalles', () => {
  let component: DetallesExhortoEnviado;
  let fixture: ComponentFixture<DetallesExhortoEnviado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesExhortoEnviado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesExhortoEnviado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
