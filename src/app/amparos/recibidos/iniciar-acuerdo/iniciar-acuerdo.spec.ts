import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IniciarAcuerdo } from './iniciar-acuerdo';

describe('IniciarAcuerdo', () => {
  let component: IniciarAcuerdo;
  let fixture: ComponentFixture<IniciarAcuerdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciarAcuerdo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IniciarAcuerdo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
