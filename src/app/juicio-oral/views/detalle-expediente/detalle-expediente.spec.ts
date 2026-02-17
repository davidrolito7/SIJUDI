import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleExpediente } from './detalle-expediente';

describe('DetalleExpediente', () => {
  let component: DetalleExpediente;
  let fixture: ComponentFixture<DetalleExpediente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleExpediente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleExpediente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
