import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarDemanda } from './listar-demanda';

describe('ListarDemanda', () => {
  let component: ListarDemanda;
  let fixture: ComponentFixture<ListarDemanda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarDemanda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarDemanda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
