import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoJuzgados } from './catalogo-juzgados';

describe('CatalogoJuzgados', () => {
  let component: CatalogoJuzgados;
  let fixture: ComponentFixture<CatalogoJuzgados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoJuzgados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoJuzgados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
