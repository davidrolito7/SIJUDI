import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarRequerimientos } from './listar-requerimientos';

describe('ListarRequerimientos', () => {
  let component: ListarRequerimientos;
  let fixture: ComponentFixture<ListarRequerimientos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarRequerimientos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarRequerimientos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
