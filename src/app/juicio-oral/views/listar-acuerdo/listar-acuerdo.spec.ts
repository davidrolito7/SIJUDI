import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarAcuerdo } from './listar-acuerdo';

describe('ListarAcuerdo', () => {
  let component: ListarAcuerdo;
  let fixture: ComponentFixture<ListarAcuerdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarAcuerdo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarAcuerdo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
