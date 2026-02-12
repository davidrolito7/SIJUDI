import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarAcuerdo } from './generar-acuerdo';

describe('Acuerdo', () => {
  let component: GenerarAcuerdo;
  let fixture: ComponentFixture<GenerarAcuerdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarAcuerdo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarAcuerdo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
