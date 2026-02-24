import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTramite } from './listar-tramite';

describe('ListarTramite', () => {
  let component: ListarTramite;
  let fixture: ComponentFixture<ListarTramite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarTramite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarTramite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
