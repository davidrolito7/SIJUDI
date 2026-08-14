import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearInhabilSede } from './crear-inhabil-sede';

describe('CrearInhabilSede', () => {
  let component: CrearInhabilSede;
  let fixture: ComponentFixture<CrearInhabilSede>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearInhabilSede],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearInhabilSede);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
