import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbitosDeCompetencia } from './ambitos-de-competencia';

describe('AmbitosDeCompetencia', () => {
  let component: AmbitosDeCompetencia;
  let fixture: ComponentFixture<AmbitosDeCompetencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbitosDeCompetencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmbitosDeCompetencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
