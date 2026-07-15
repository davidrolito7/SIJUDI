// tramites-busqueda-state.service.ts
import { Injectable } from '@angular/core';
import { CatJuzgadoResponse, TramitesElectronicosRecibidosResponse } from '../interface/tramites-juicio-oral.model';

export interface TramitesBusquedaState {
  filtros: {
    idCatTipoTramite: number | null;
    numeroExpediente: string;
    idJuzgado: number | null;
    idPantalla: number;
  };
  catJuzgados: CatJuzgadoResponse[];
  resultados: TramitesElectronicosRecibidosResponse[];
  mostrarTramites: boolean;
}

@Injectable({ providedIn: 'root' })
export class TramitesBusquedaStateService {
  private readonly storageKey = 'tramites-juicio-oral-busqueda';
  private estado: TramitesBusquedaState | null = null;

  guardar(estado: TramitesBusquedaState) {
    this.estado = estado;
    sessionStorage.setItem(this.storageKey, JSON.stringify(estado));
  }

  recuperar() {
    if (this.estado) {
      return this.estado;
    }

    const estadoGuardado = sessionStorage.getItem(this.storageKey);

    if (!estadoGuardado) {
      return null;
    }

    this.estado = JSON.parse(estadoGuardado) as TramitesBusquedaState;
    return this.estado;
  }

  limpiar() {
    this.estado = null;
    sessionStorage.removeItem(this.storageKey);
  }
}
