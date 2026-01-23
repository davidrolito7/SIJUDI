import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTramite } from './crear-tramite';

describe('CrearTramite', () => {
  let component: CrearTramite;
  let fixture: ComponentFixture<CrearTramite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTramite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTramite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
