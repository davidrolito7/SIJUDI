import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarAudiencias } from './listar-audiencias';

describe('ListarAudiencias', () => {
  let component: ListarAudiencias;
  let fixture: ComponentFixture<ListarAudiencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarAudiencias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarAudiencias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
