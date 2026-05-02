import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, of, Subscription, switchMap, timer } from "rxjs";
import { JuicioService } from "./juicioenlinea.service";
import { ContadoresDemandas } from "../interfaces/juicioenlinea.model";

@Injectable({ providedIn: 'root' })
export class ContadoresService {
  private contadores$ = new BehaviorSubject<ContadoresDemandas>({
    pendientes_recibir: 0,
    pendientes_turnar: 0,
  });

  readonly contadores = this.contadores$.asObservable();
  private polling$?: Subscription;

  // Mapeo: idPantalla → clave en el objeto de contadores
  private readonly badgeMap: Record<number, keyof ContadoresDemandas> = {
    14311: 'pendientes_recibir',  // Recibir Demanda
    14313: 'pendientes_turnar',   // Turnar Demanda
  };

  constructor(private juicioService: JuicioService) {}

  iniciarPolling(intervaloMs = 60000000): void {
    this.polling$?.unsubscribe();
    this.polling$ = timer(0, intervaloMs).pipe(
      switchMap(() => this.juicioService.getContadores()),
      map(res => res.data ?? { pendientes_recibir: 0, pendientes_turnar: 0 }),
      catchError(() => of(this.contadores$.value))
    ).subscribe(c => this.contadores$.next(c));
  }

  detenerPolling(): void {
    this.polling$?.unsubscribe();
  }

  refrescar(): void {
    this.juicioService.getContadores().pipe(
      map(res => res.data ?? { pendientes_recibir: 0, pendientes_turnar: 0 })
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