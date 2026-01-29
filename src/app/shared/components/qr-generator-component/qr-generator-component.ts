import { Component,Input  } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-generator-component',
  imports: [],
  templateUrl: './qr-generator-component.html',
  styleUrl: './qr-generator-component.css',
})
export class QrGeneratorComponent {
@Input() qrData: string = ''; // Recibirá el valor desde el padre
qrCodeUrl: string = '';
ngOnInit() {
this.generateQR();
}

async generateQR() {
    if (!this.qrData.trim()) {
      this.qrCodeUrl = '';
      return;
    }

    try {
      // Genera el código QR como Data URL
      this.qrCodeUrl = await QRCode.toDataURL(this.qrData, {
        width: 100,
        margin: 5,
        color: {
          dark: '#A6518C',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generando QR:', error);
    }
  }
}
