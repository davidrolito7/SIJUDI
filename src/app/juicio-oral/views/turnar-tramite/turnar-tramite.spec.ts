import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnarTramite } from './turnar-tramite';

describe('TurnarTramite', () => {
  let component: TurnarTramite;
  let fixture: ComponentFixture<TurnarTramite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnarTramite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnarTramite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
