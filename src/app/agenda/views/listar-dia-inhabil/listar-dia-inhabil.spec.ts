import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarDiaInhabil } from './listar-dia-inhabil';

describe('ListarDiaInhabil', () => {
  let component: ListarDiaInhabil;
  let fixture: ComponentFixture<ListarDiaInhabil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarDiaInhabil],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarDiaInhabil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
