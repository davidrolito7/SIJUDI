import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAudiencia } from './crear-audiencia';

describe('CrearAudiencia', () => {
  let component: CrearAudiencia;
  let fixture: ComponentFixture<CrearAudiencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAudiencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearAudiencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
