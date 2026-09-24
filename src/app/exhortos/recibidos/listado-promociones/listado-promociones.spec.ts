import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPromociones } from './listado-promociones';

describe('ListadoPromociones', () => {
  let component: ListadoPromociones;
  let fixture: ComponentFixture<ListadoPromociones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPromociones],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoPromociones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
