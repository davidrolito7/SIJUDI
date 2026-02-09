import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompetenciaDialog} from './incompetencia-dialog';

describe('Incompetencia', () => {
  let component: IncompetenciaDialog;
  let fixture: ComponentFixture<IncompetenciaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncompetenciaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncompetenciaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
