import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-pdf-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './pdf-dialog.html',
  styleUrl: './pdf-dialog.css',
})
export class PdfDialog implements OnChanges {
  @Input() header = '';
  @Input() url: string | null = null;     // string (incluye blob:...)
  @Input() visible = false;

  @Output() visibleChange = new EventEmitter<boolean>();

  safeIframeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('url' in changes) {
      this.safeIframeUrl = this.url
        ? this.sanitizer.bypassSecurityTrustResourceUrl(this.url)
        : null;
    }
  }

  onVisibleChange(value: boolean) {
    this.visibleChange.emit(value);
  }
}
