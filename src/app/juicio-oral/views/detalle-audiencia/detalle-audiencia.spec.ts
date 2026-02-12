import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleAudiencia } from './detalle-audiencia';

describe('DetaalleAudiencia', () => {
  let component: DetalleAudiencia;
  let fixture: ComponentFixture<DetalleAudiencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleAudiencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleAudiencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
