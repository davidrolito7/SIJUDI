import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Promocion } from './promocion';

describe('Promocion', () => {
  let component: Promocion;
  let fixture: ComponentFixture<Promocion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Promocion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Promocion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
