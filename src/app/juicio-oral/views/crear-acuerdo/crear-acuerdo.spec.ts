import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAcuerdo } from './crear-acuerdo';

describe('CrearAcuerdo', () => {
  let component: CrearAcuerdo;
  let fixture: ComponentFixture<CrearAcuerdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAcuerdo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearAcuerdo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
