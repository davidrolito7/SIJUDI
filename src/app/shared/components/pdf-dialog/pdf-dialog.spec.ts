import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDialog } from './pdf-dialog';

describe('PdfDialog', () => {
  let component: PdfDialog;
  let fixture: ComponentFixture<PdfDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
