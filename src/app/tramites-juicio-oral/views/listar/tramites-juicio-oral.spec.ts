import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TramitesJuicioOral } from './tramites-juicio-oral';

describe('TramitesJuicioOral', () => {
  let component: TramitesJuicioOral;
  let fixture: ComponentFixture<TramitesJuicioOral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TramitesJuicioOral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TramitesJuicioOral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
