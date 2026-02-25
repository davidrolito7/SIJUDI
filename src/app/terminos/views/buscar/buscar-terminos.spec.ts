import { ComponentFixture, TestBed } from '@angular/core/testing';

import { buscarTerminosComponent } from '../buscar/buscar-terminos';

describe('Buscar', () => {
  let component: buscarTerminosComponent;
  let fixture: ComponentFixture<buscarTerminosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [buscarTerminosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(buscarTerminosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
