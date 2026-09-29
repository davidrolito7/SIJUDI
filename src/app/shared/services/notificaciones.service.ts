import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../core/auth/service/token.service';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';
import { BandejaNotificacionesResponse, CrearNotificacionRequest, GenericResponse, NotificacionResponse } from '../interface/shared.interface';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {

  private readonly apiUrl = environment.urlApiNotificaciones;
  private socket?: Socket;

  private readonly notificacion$ = new Subject<GenericResponse<NotificacionResponse>>();

  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly ngZone = inject(NgZone);

  private getToken(): string {
    return this.tokenService.getToken() ?? '';
  }

  obtenerMisNotificaciones(): Observable<GenericResponse<BandejaNotificacionesResponse>> {
    return this.http.get<GenericResponse<BandejaNotificacionesResponse>>(
      `${this.apiUrl}/api/notificaciones`,
      { context: checkToken() }
    );
  }

  crearNotificacion(payload: CrearNotificacionRequest): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<any>>(
      `${this.apiUrl}/api/notificaciones`,
      payload,
      { context: checkToken() }
    );
  }

  marcarLeida(id: number): Observable<GenericResponse<any>> {
    return this.http.put<GenericResponse<any>>(
      `${this.apiUrl}/api/notificaciones/${id}`,
      {},
      { context: checkToken() }
    );
  }

  conectarSocket(): void {
    const token = this.getToken();

    if (!token) {
      console.warn('[NotificacionesService] No hay token para conectar Socket.IO');
      return;
    }

    if (this.socket) {
      if (!this.socket.connected) {
        this.socket.connect();
      }

      return;
    }
    const url = new URL(this.apiUrl);
    const basePath = url.pathname.replace(/\/+$/, '');

    this.socket = io(url.origin, {
      path: `${basePath}/socket.io`,
      auth: { token },
    });
    
    this.socket.on('connect', () => {
      console.log('[NotificacionesService] Socket.IO conectado:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[NotificacionesService] Error de conexión Socket.IO:', error.message);
    });

    this.socket.on('notificacion', (data: NotificacionResponse) => {
      console.log('[Socket notificacion raw]', data);

      this.ngZone.run(() => {
        this.notificacion$.next({
          success: true,
          message: 'Notificación recibida',
          errors: [],
          data
        });
      });
    });
  }

  desconectarSocket(): void {
    if (!this.socket) return;

    this.socket.off('notificacion');
    this.socket.off('connect');
    this.socket.off('connect_error');
    this.socket.disconnect();
    this.socket = undefined;

    console.log('[NotificacionesService] Socket.IO desconectado');
  }

  escucharNotificaciones(): Observable<GenericResponse<NotificacionResponse>> {
    return this.notificacion$.asObservable();
  }
}