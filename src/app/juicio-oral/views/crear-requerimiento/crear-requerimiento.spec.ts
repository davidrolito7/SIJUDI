import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRequerimiento } from './crear-requerimiento';

describe('CrearRequerimiento', () => {
  let component: CrearRequerimiento;
  let fixture: ComponentFixture<CrearRequerimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRequerimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearRequerimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
