import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, of, Subscription, switchMap, timer } from "rxjs";
import { JuicioService } from "./juicioenlinea.service";
import { ContadoresTramites } from "../interfaces/juicioenlinea.model";

@Injectable({ providedIn: 'root' })
export class ContadoresService {
  private contadores$ = new BehaviorSubject<ContadoresTramites>({
    demandas_pendientes_turnar: 0,
    tramites_pendientes_turnar: 0,
    pendientes_recibir: 0,
    expedientes_activos: 0,
    acuerdos_sin_firmar: 0
  });

  readonly contadores = this.contadores$.asObservable();
  private polling$?: Subscription;

  // Mapeo: idPantalla → clave en el objeto de contadores
  private readonly badgeMap: Record<number, keyof ContadoresTramites> = {
    14313: 'demandas_pendientes_turnar',   // Inicios pendientes
    14321: 'tramites_pendientes_turnar',  // Turnar tramite
    14320: 'pendientes_recibir', // Entrega - Recepcion
    14315: 'acuerdos_sin_firmar', // Acuerdos sin firmar
  };

  constructor(private juicioService: JuicioService) { }

cargarContadores(): void {
  this.polling$?.unsubscribe();

  this.polling$ = this.juicioService.getContadores().pipe(
    map(res => res.data ?? {
      demandas_pendientes_turnar: 0,
      tramites_pendientes_turnar: 0,
      pendientes_recibir: 0
    }),
    catchError(() => of(this.contadores$.value))
  ).subscribe(c => this.contadores$.next(c));
}

  detenerPolling(): void {
    this.polling$?.unsubscribe();
  }

  refrescar(): void {
    this.juicioService.getContadores().pipe(
      map(res => res.data ?? { demandas_pendientes_turnar: 0, tramites_pendientes_turnar: 0, pendientes_recibir: 0 })
    ).subscribe(c => this.contadores$.next(c));
  }

  /**
   * Devuelve el conteo para una pantalla específica, o null si no tiene badge.
   */
  getContadorParaPantalla(IdPantalla: number): Observable<number | null> {
    const clave = this.badgeMap[IdPantalla];
    if (!clave) return of(null);
    return this.contadores.pipe(map(c => c[clave] ?? null));
  }
}