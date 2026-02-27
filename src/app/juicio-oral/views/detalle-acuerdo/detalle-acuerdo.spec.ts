import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleAcuerdo } from './detalle-acuerdo';

describe('DetalleAcuerdo', () => {
  let component: DetalleAcuerdo;
  let fixture: ComponentFixture<DetalleAcuerdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleAcuerdo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleAcuerdo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
