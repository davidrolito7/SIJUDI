import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesExhortoRecibido } from './detalles-exhorto-recibido';

describe('Detalles', () => {
  let component: DetallesExhortoRecibido;
  let fixture: ComponentFixture<DetallesExhortoRecibido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesExhortoRecibido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesExhortoRecibido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
