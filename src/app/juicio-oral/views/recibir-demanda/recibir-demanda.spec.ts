import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecibirDemanda } from './recibir-demanda';

describe('TurnarDemanda', () => {
  let component: RecibirDemanda;
  let fixture: ComponentFixture<RecibirDemanda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecibirDemanda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecibirDemanda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
