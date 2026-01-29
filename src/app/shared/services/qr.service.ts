import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QrService {
  private qrDataSubject = new BehaviorSubject<string>('');
  qrData$ = this.qrDataSubject.asObservable();

  updateQRData(data: string) {
    this.qrDataSubject.next(data);
  }
}
