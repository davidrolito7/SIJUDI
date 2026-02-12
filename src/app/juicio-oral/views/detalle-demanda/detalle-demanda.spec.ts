import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDemanda } from './detalle-demanda';

describe('DetalleDemanda', () => {
  let component: DetalleDemanda;
  let fixture: ComponentFixture<DetalleDemanda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleDemanda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleDemanda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
