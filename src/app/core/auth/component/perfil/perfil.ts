import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import type { Observable } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TokenService } from '../../service/token.service';
import { AuthService } from '../../service/auth.service';
import { areasResponse, responseCatalogoPerfiles } from '../../interface/login.interfaces';
import { GenericResponse } from '../../../../shared/interface/shared.interface';
import { Spinner } from '../../../../shared/components/spinner/spinner';

const SISTEMA_ID = 4169;

interface PersistedSelection {
  recordar: boolean;
  areaId: number;
  perfilId: number;
  perfilDesc: string;
}

@Component({
  selector: 'app-perfil',
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    Spinner,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class Perfil {
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);

  readonly listaAreas = signal<areasResponse[]>([]);
  readonly perfiles = signal<responseCatalogoPerfiles[]>([]);

  readonly idGeneral = signal(0);
  readonly idAreaSistemaUsuario = signal(0);

  readonly areaSeleccionada = signal(0);
  readonly perfilSeleccionado = signal(0);
  readonly perfilNombreSeleccionado = signal('');

  recordar = false;

  readonly canContinue = computed(
    () => this.areaSeleccionada() > 0 && this.perfilSeleccionado() > 0
  );

  ngOnInit(): void {
    const persisted = this.readPersistedSelection();

    this.recordar = persisted.recordar;
    this.areaSeleccionada.set(persisted.areaId);
    this.perfilSeleccionado.set(persisted.perfilId);
    this.perfilNombreSeleccionado.set(persisted.perfilDesc);

    this.loadUserAndAreas(persisted.areaId, persisted.perfilId);
  }

  onAreaChange(areaId: number): void {
    this.areaSeleccionada.set(areaId);

    // Cambio manual de área => reset de perfil
    this.perfilSeleccionado.set(0);
    this.perfilNombreSeleccionado.set('');
    this.perfiles.set([]);
    this.idAreaSistemaUsuario.set(0);

    if (areaId <= 0) return;

    this.loadPerfilesForArea(areaId, 0);
  }

  onPerfilChange(perfilId: number): void {
    this.perfilSeleccionado.set(perfilId);

    const selected = this.perfiles().find(p => p.idSistemaPerfil === perfilId);
    this.perfilNombreSeleccionado.set(selected?.descripcion ?? '');
  }

  continuar(): void {
    if (!this.canContinue()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Campos requeridos',
        detail: 'Debes seleccionar un área y un perfil',
      });
      return;
    }

    const store = this.recordar ? localStorage : sessionStorage;
    const other = this.recordar ? sessionStorage : localStorage;

    // “recordarUsuario” siempre en local para sobrevivir reinicios del navegador
    localStorage.setItem('recordarUsuario', this.recordar ? 'true' : 'false');

    store.setItem('areaSeleccionada', String(this.areaSeleccionada()));
    store.setItem('perfilSeleccionado', String(this.perfilSeleccionado()));
    store.setItem('perfilSeleccionadoDesc', this.perfilNombreSeleccionado());
    store.setItem('idAreaSistemaUsuario', String(this.idAreaSistemaUsuario()));

    // Limpia la otra storage
    other.removeItem('areaSeleccionada');
    other.removeItem('perfilSeleccionado');
    other.removeItem('perfilSeleccionadoDesc');
    other.removeItem('idAreaSistemaUsuario');

    this.messageService.add({
      severity: 'success',
      summary: 'Operación exitosa',
      detail: 'Área y perfil seleccionados correctamente',
    });

    this.tokenService.setPerfilCompleted(true);
    this.router.navigate(['/tramites-juicio-oral'], { replaceUrl: true });
  }

  // --------------------
  // Carga de datos
  // --------------------

  private loadUserAndAreas(restoreAreaId: number, restorePerfilId: number): void {
    const user = this.tokenService.getUserFromToken();
    if (!user?.Usr) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sesión inválida',
        detail: 'No se pudo obtener el usuario desde el token.',
      });
      return;
    }

    this.isLoading.set(true);

    this.authService
      .obtenerDatosUsuario(user.Usr)
      .pipe(
        map(resp => resp.data?.pD_Abogados?.[0]?.idGeneral ?? 0),
        tap(idG => this.idGeneral.set(idG)),
        switchMap(idG => {
          if (!idG) return of<areasResponse[]>([]);
          return this.authService.getAreas(SISTEMA_ID, idG).pipe(
            map(r => (r.data ?? []) as areasResponse[])
          );
        }),
        tap(areas => {
          this.listaAreas.set(areas);

          const validArea =
            restoreAreaId > 0 && areas.some(a => a.idArea === restoreAreaId);

          this.areaSeleccionada.set(validArea ? restoreAreaId : 0);

          if (!validArea) {
            this.perfilSeleccionado.set(0);
            this.perfilNombreSeleccionado.set('');
            this.perfiles.set([]);
          }
        }),
        switchMap(() => {
          const areaId = this.areaSeleccionada();
          if (areaId > 0) return this.loadPerfilesForArea$(areaId, restorePerfilId);
          return of(null);
        }),
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar áreas/perfiles.',
          });
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private loadPerfilesForArea(areaId: number, restorePerfilId: number): void {
    this.isLoading.set(true);

    this.loadPerfilesForArea$(areaId, restorePerfilId)
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el catálogo de perfiles.',
          });
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private loadPerfilesForArea$(areaId: number, restorePerfilId: number): Observable<responseCatalogoPerfiles[] | null> {
    const idG = this.idGeneral();
    if (!idG) return of(null);

    return this.authService
      .obtenerIdAreaSistemaUsuario(idG, SISTEMA_ID, areaId)
      .pipe(
        map(r => r.data?.idAreaSistemaUsuario ?? 0),
        tap(idAreaSysUsr => this.idAreaSistemaUsuario.set(idAreaSysUsr)),
        switchMap(idAreaSysUsr => {
          if (!idAreaSysUsr) return of<responseCatalogoPerfiles[]>([]);
          return this.authService.GetPerfiles(idAreaSysUsr).pipe(
            map((r: GenericResponse<responseCatalogoPerfiles[]>) => r.data ?? [])
          );
        }),
        tap(perfiles => {
          this.perfiles.set(perfiles);

          const validPerfil =
            restorePerfilId > 0 &&
            perfiles.some(p => p.idSistemaPerfil === restorePerfilId);

          const perfilId = validPerfil ? restorePerfilId : 0;

          this.perfilSeleccionado.set(perfilId);

          const sel = perfiles.find(p => p.idSistemaPerfil === perfilId);
          this.perfilNombreSeleccionado.set(sel?.descripcion ?? '');
        }),
        map(perfiles => perfiles)
      );
  }

  // --------------------
  // Persistencia
  // --------------------

  private readPersistedSelection(): PersistedSelection {
    const recordar = localStorage.getItem('recordarUsuario') === 'true';

    const primary = recordar ? localStorage : sessionStorage;
    const fallback = recordar ? sessionStorage : localStorage;

    const areaId =
      this.readNumber(primary, 'areaSeleccionada') ||
      this.readNumber(fallback, 'areaSeleccionada');

    const perfilId =
      this.readNumber(primary, 'perfilSeleccionado') ||
      this.readNumber(fallback, 'perfilSeleccionado');

    const perfilDesc =
      primary.getItem('perfilSeleccionadoDesc') ??
      fallback.getItem('perfilSeleccionadoDesc') ??
      '';

    return {
      recordar,
      areaId,
      perfilId,
      perfilDesc,
    };
  }

  private readNumber(storage: Storage, key: string): number {
    const raw = storage.getItem(key);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
}
