// tramites-busqueda-state.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TramitesBusquedaStateService {
  private estado: {
    idCatTipoTramite: number | null;
    numeroExpediente: string;
    idJuzgado: number | null;
    idPantalla: number;
  } | null = null;

  guardar(valores: typeof this.estado) {
    this.estado = valores;
  }

  recuperar() {
    return this.estado;
  }

  limpiar() {
    this.estado = null;
  }
}