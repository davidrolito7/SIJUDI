import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LlaveAcceso } from './llave-acceso';

describe('LlaveAcceso', () => {
  let component: LlaveAcceso;
  let fixture: ComponentFixture<LlaveAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlaveAcceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LlaveAcceso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
