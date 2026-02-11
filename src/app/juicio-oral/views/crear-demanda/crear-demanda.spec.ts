import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDemanda } from './crear-demanda';

describe('CrearDemanda', () => {
  let component: CrearDemanda;
  let fixture: ComponentFixture<CrearDemanda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDemanda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDemanda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
