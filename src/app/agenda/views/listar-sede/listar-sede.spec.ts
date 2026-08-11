import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarSede } from './listar-sede';

describe('ListarSede', () => {
  let component: ListarSede;
  let fixture: ComponentFixture<ListarSede>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarSede],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarSede);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
