import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecibirExhortoJuzgado } from './recibir-exhorto-juzgado';

describe('RecibirExhortoJuzgado', () => {
  let component: RecibirExhortoJuzgado;
  let fixture: ComponentFixture<RecibirExhortoJuzgado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecibirExhortoJuzgado],
    }).compileComponents();

    fixture = TestBed.createComponent(RecibirExhortoJuzgado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
