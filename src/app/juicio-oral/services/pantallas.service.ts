import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SistemaModuloResponse } from '../interfaces/juicioenlinea.model';
import { ApiResponse } from '../interfaces/juicioenlinea.model';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';

@Injectable({ providedIn: 'root' })
export class PantallasService {
  private pantallas: SistemaModuloResponse[] | null = null;
  private permisos = 'http://10.1.10.50:81/api/Permisos/';
  private storageKey = 'pantallas_usuario';

  // --- vigilancia ---
  private lastSnapshot = '';
  private watcherStarted = false;

  constructor(private http: HttpClient) {}

  getPantallas(): SistemaModuloResponse[] | null {
    if (!this.pantallas && typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.loadFromStorage(stored);
      }
    }
    return this.pantallas;
  }

  cargarPantallas(): Observable<SistemaModuloResponse[]> {
    if (this.pantallas) {
      return of(this.pantallas);
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.loadFromStorage(stored);
        return of(this.pantallas ?? []);
      }
    }
    return this.getPatallasUsuario().pipe(
      tap(res => {
        this.pantallas = res.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(res.data));
          this.saveSnapshot();
        }
      }),
      map(res => res.data ?? [])
    );
  }

  getPatallasUsuario(): Observable<ApiResponse<SistemaModuloResponse[]>> {
    const url = `${this.permisos}ModulosYPantallas`;
    return this.http.get<ApiResponse<SistemaModuloResponse[]>>(url, { context: checkToken() });
  }

  setPantallas(data: SistemaModuloResponse[]) {
    this.pantallas = data;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.saveSnapshot();
    }
  }

  limpiarPantallas() {
    this.pantallas = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      this.lastSnapshot = '';
    }
  }
 tienePermiso(rutaPantalla: string): boolean {
  const modulos = this.getPantallas();
  if (!modulos) return false;

  return modulos.some(modulo =>
    modulo.pantallas?.some(p => p.descripcion === rutaPantalla)
  );
}
  // --- iniciar watcher (llamar una sola vez tras login) ---
  startIntegrityWatcher(onTamper: () => void) {
    if (this.watcherStarted || typeof window === 'undefined') return;
    this.watcherStarted = true;

    window.addEventListener('storage', e => {
      if (e.key === this.storageKey) {
        if (!this.isSnapshotValid(e.newValue)) {
          onTamper();
        } else {
          this.lastSnapshot = e.newValue || '';
        }
      }
    });

    setInterval(() => {
      const current = localStorage.getItem(this.storageKey) || '';
      if (current !== this.lastSnapshot) {
        if (!this.isSnapshotValid(current)) {
          onTamper();
        } else {
          this.lastSnapshot = current;
        }
      }
    }, 2000);
  }

  // --- helpers ---
  private loadFromStorage(raw: string) {
    try {
      const parsed = JSON.parse(raw);
      if (this.isShapeValid(parsed)) {
        this.pantallas = parsed;
        this.lastSnapshot = raw;
      } else {
        this.pantallas = null;
      }
    } catch {
      this.pantallas = null;
    }
  }

  private saveSnapshot() {
    this.lastSnapshot = localStorage.getItem(this.storageKey) || '';
  }

  private isSnapshotValid(raw: string | null): boolean {
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return this.isShapeValid(parsed);
    } catch {
      return false;
    }
  }

  // Validación mínima (ajusta a tus campos reales)
  private isShapeValid(obj: any): boolean {
    if (!Array.isArray(obj)) return false;
    // Ejemplo: cada item al menos objeto
    return obj.every(it => typeof it === 'object' && it !== null);
  }
}