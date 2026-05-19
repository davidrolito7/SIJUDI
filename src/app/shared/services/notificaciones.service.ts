import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../core/auth/service/token.service';

export interface Notificacion {
  id: number;
  folio: string;
  mensaje: string;
  accion: string;
  fecha_creacion?: string;
  fecha?: string;
  leida?: boolean;
  idAreaDestino?: number;
  idSistemaPerfilDestino?: number;
  idSubAreaDestino?: number;
}

export interface CrearNotificacionRequest {
  folio: string;
  accion: string;
  mensaje: string;
  idAreaDestino: number;
  idSistemaPerfilDestino: number;
  idSubAreaDestino: number;
}

export interface BandejaNotificacionesResponse {
  pendientes: number;
  notificaciones: Notificacion[];
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {

  private readonly apiUrl = environment.urlApiNotificaciones;
  private socket?: Socket;

  private readonly notificacion$ = new Subject<Notificacion>();

  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly ngZone = inject(NgZone);

  private getToken(): string {
    return this.tokenService.getToken() ?? '';
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
  }

  obtenerMisNotificaciones(): Observable<BandejaNotificacionesResponse> {
    return this.http.get<BandejaNotificacionesResponse>(
      `${this.apiUrl}/api/notificaciones/me`,
      { headers: this.getHeaders() }
    );
  }

  crearNotificacion(payload: CrearNotificacionRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/notificaciones`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  marcarLeida(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/notificaciones/${id}/leer`,
      {},
      { headers: this.getHeaders() }
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

    this.socket = io(this.apiUrl, {
      transports: ['websocket'],
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('[NotificacionesService] Socket.IO conectado:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[NotificacionesService] Error de conexión Socket.IO:', error.message);
    });

    this.socket.on('notificacion', (data: Notificacion) => {
      this.ngZone.run(() => {
        this.notificacion$.next({
          ...data,
          leida: data.leida ?? false
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

  escucharNotificaciones(): Observable<Notificacion> {
    return this.notificacion$.asObservable();
  }
}