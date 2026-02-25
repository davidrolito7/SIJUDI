import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleTramite } from './detalle-tramite';

describe('DetalleTramite', () => {
  let component: DetalleTramite;
  let fixture: ComponentFixture<DetalleTramite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTramite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleTramite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
