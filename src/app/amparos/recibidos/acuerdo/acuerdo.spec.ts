import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acuerdo } from './acuerdo';

describe('Acuerdo', () => {
  let component: Acuerdo;
  let fixture: ComponentFixture<Acuerdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acuerdo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Acuerdo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
