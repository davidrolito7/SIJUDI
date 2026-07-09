import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-generator-component',
  imports: [],
  templateUrl: './qr-generator-component.html',
  styleUrl: './qr-generator-component.css',
})
export class QrGeneratorComponent implements OnChanges {
  @Input() qrData: string | null = null;

  qrCodeUrl = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['qrData']) {
      void this.generateQR();
    }
  }

  async generateQR(): Promise<void> {
    if (!this.qrData?.trim()) {
      this.qrCodeUrl = '';
      return;
    }

    try {
      this.qrCodeUrl = await QRCode.toDataURL(this.qrData, {
        width: 150,
        margin: 0,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generando QR:', error);
    }
  }
}
