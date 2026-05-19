import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class ReverbService {
  private echo!: Echo<any>;

  constructor() {
    (window as any).Pusher = Pusher;

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: 'ly3wfjlra0ooldbilcus',
      wsHost: '127.0.0.1',
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ['ws'],
      disableStats: true,
    });
  }

  escucharTramitesPorArea(
    idArea: number,
    callback: (tramite: any) => void
  ): void {
    console.log(`Escuchando canal area.${idArea}`);

    this.echo
      .channel(`area.${idArea}`)
      .listen('.TramiteRecibido', (event: any) => {
        console.log('Trámite recibido por Reverb:', event);
        callback(event.tramite);
      });
  }

  salirDeArea(idArea: number): void {
    this.echo.leave(`area.${idArea}`);
  }
}