import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarExpediente } from './listar-expediente';

describe('ListarExpediente', () => {
  let component: ListarExpediente;
  let fixture: ComponentFixture<ListarExpediente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarExpediente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarExpediente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
