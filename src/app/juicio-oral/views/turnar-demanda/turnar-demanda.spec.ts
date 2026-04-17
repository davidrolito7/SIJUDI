import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnarDemanda } from './turnar-demanda';

describe('TurnarDemanda', () => {
  let component: TurnarDemanda;
  let fixture: ComponentFixture<TurnarDemanda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnarDemanda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnarDemanda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
