import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarInhabilSede } from './listar-inhabil-sede';

describe('ListarInhabilSede', () => {
  let component: ListarInhabilSede;
  let fixture: ComponentFixture<ListarInhabilSede>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarInhabilSede],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarInhabilSede);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
