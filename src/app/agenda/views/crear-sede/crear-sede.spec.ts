import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSede } from './crear-sede';

describe('CrearSede', () => {
  let component: CrearSede;
  let fixture: ComponentFixture<CrearSede>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSede],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearSede);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
