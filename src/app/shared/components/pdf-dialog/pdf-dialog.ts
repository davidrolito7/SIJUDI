import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-pdf-dialog',
  imports: [CommonModule, DialogModule],
  templateUrl: './pdf-dialog.html',
  styleUrl: './pdf-dialog.css',
})

export class PdfDialog {
  @Input() header = '';
  @Input() url: any = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  onVisibleChange(value: boolean) {
    this.visibleChange.emit(value);
  }
}
