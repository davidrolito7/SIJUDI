import { Component, OnInit, signal } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { ListarExpedientesResponse } from '../../interfaces/juicioenlinea.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AuthService } from '../../../core/auth/service/auth.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { TooltipModule } from 'primeng/tooltip';
import { Header } from "../../../shared/components/header/header";
import { PantallasService } from '../../services/pantallas.service';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { TokenService } from '../../../core/auth/service/token.service';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-detalle-expediente',
  imports: [CommonModule, RouterModule, DatePickerModule, FormsModule, RadioButtonModule, ButtonModule, TagModule,
    IconFieldModule, InputIconModule, TableModule, SelectModule, InputTextModule, InputMaskModule, TooltipModule, Header, Spinner, SpeedDialModule],
  templateUrl: './detalle-expediente.html',
  styleUrl: './detalle-expediente.css',
})
export class DetalleExpediente {
  idExpediente: number | undefined;
  detalleExpediente: ListarExpedientesResponse[] | null = null;
  expediente = signal<ListarExpedientesResponse | null>(null);
  tablaDatos = signal<any[]>([]);
  isLoading: boolean = true;
  // Opciones para el select de tipo (ajusta los valores según tus tipos reales)
  tipoOptions = [
    { label: 'Todo', value: 0 },
    { label: 'Requerimientos', value: 1 },
    { label: 'Trámites', value: 2 },
    { label: 'Audiencias', value: 3 }
  ];

  filtro: { folio: string; rangeDates: Date[] | ''; tipo: number } = {
    folio: '',
    rangeDates: '',
    tipo: 0, // 0 = todos
  };

  // Paginación
  pagination: { current_page: number; per_page: number; total: number; last_page: number } = {
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  };

  Math = Math;
  mostrarDropdown = false;

  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private au: AuthService,
    private route: ActivatedRoute,
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    const state = window.history.state as { idExpediente?: number };
    if (!state?.idExpediente) {
      console.warn('No se proporcionó idExpediente.');
      return;
    }
    this.idExpediente = state.idExpediente;

    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
    const page = params['page'] ? +params['page'] : 1;
    this.cargarDatos(page);
  }

  private sincronizarFiltrosDesdeURL(params: Record<string, string>): void {
    this.filtro.tipo = params['tipo'] ? Number(params['tipo']) : 0;
    this.filtro.folio = params['folio'] || '';
    this.filtro.rangeDates =
      params['fechaInicio'] && params['fechaFinal']
        ? [
          this.parseDateFromString(params['fechaInicio']),
          this.parseDateFromString(params['fechaFinal']),
        ]
        : '';
  }

  private cargarDatos(page: number): void {
    this.isLoading = true;
    if (!this.idExpediente) return;

    const requestParams: Record<string, string | number> = {
      page,
      per_page: 5,
    };

    if (this.filtro.folio) requestParams['folio'] = this.filtro.folio;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    if (this.filtro.tipo) requestParams['tipo'] = this.filtro.tipo;

    this.juicioService.getDetalleExpediente(this.idExpediente, requestParams).subscribe({
      next: (response) => {
        const data: any = response?.data ?? {};
        this.expediente.set(data || null);
        this.pagination = data.pagination || {
          current_page: 1,
          per_page: 5,
          total: 0,
          last_page: 1
        };
        let registros: any[] = [];
        if (Array.isArray(data.registros)) {
          registros = data.registros.filter(Boolean);
        } else {
          // Ya no incluimos data.demanda por separado, ahora viene dentro de tramites
          if (Array.isArray(data.tramites)) registros.push(...data.tramites.map((t: any) => ({ ...t, tipo: 'tramite' })));
          if (Array.isArray(data.requerimientos)) registros.push(...data.requerimientos.map((r: any) => ({ ...r, tipo: 'requerimiento' })));
          if (Array.isArray(data.audiencias)) registros.push(...data.audiencias.map((a: any) => ({ ...a, tipo: 'audiencia' })));
          if (Array.isArray(data.acuerdos)) registros.push(...data.acuerdos.map((a: any) => ({ ...a, tipo: 'acuerdo' })));
        }

        this.detalleExpediente = registros;
        this.tablaDatos.set(this.buildTablaDatos(registros));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el detalle:', error);
        this.detalleExpediente = null;
        this.expediente.set(null);
        this.isLoading = false;
      }
    });
  }

  // ─── Helper: navega al mismo route reinyectando el state ───────────────────
  private navigatePreservingState(
    queryParams: Record<string, unknown>,
    extras?: { replaceUrl?: boolean }
  ): void {
    const currentState = window.history.state as { idExpediente?: number;[k: string]: unknown };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: extras?.replaceUrl ?? false,
      state: currentState, //  state
    });
  }
  // ───────────────────────────────────────────────────────────────────────────

  aplicarFiltros(): void {
    const queryParams: any = {
      tipo: this.filtro.tipo || null,
      folio: this.filtro.folio || null,
      page: 1,
    };

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      queryParams.fechaInicio = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      queryParams.fechaFinal = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    } else {
      queryParams.fechaInicio = null;
      queryParams.fechaFinal = null;
    }

    this.navigatePreservingState(queryParams);
    this.cargarDatos(1);
  }

  limpiarFiltros(): void {
    this.filtro = {
      tipo: 0,
      rangeDates: '',
      folio: ''
    };

    this.navigatePreservingState({
      tipo: 0,
      folio: null,
      fechaInicio: null,
      fechaFinal: null,
      page: 1
    });

    this.cargarDatos(1);
  }

  cambiarPagina(page: number): void {
    this.navigatePreservingState({ page }, { replaceUrl: true });
    this.cargarDatos(page);
  }

  verDetalle(item: any): void {
    const data = item.datosOriginales;

    if (item.tipo === 'Requerimiento') {
      this.router.navigate(['/juicioenlinea/requerimientos/detalle'], { state: { idRequerimiento: item.id } });
    } else if (item.tipo === 'tramite') {
      // Manejo polimórfico: si es tipo Entidad 'Demanda', ir a su detalle
      if (data.tipoEntidad === 'Demanda') {
        this.router.navigate(['/juicioenlinea/demandas/detalle'], { state: { idDemanda: data.entidad.idDemanda } });
      } else {
        this.router.navigate(['/juicioenlinea/tramites/detalle'], { state: { idTramite: data.idTramite } });
      }
    } else if (item.tipo === 'Audiencia') {
      this.router.navigate(['/juicioenlinea/audiencias/detalle'], { state: { idAudiencia: data.idAudiencia } });
    } else if (item.tipo === 'acuerdo') {
      this.router.navigate(['/juicioenlinea/acuerdos/detalle'], { state: { idAcuerdo: item.id } });
    }
  }

  irACrearRequerimiento(idExpediente: number, NumExpediente: string) {
    this.router.navigate(['/juicioenlinea/requerimientos/crear'], { state: { idExpediente, NumExpediente } });
  }

  goCrearAudiencia(idExpediente: number, NumExpediente: string) {
    this.router.navigate(['/juicioenlinea/audiencias/crear'], { state: { idExpediente, NumExpediente } });
  }

  irACrearTramite(idExpediente: number, NumExpediente: string) {
    this.router.navigate(['/juicioenlinea/tramites/crear'], { state: { idExpediente, NumExpediente } });
  }

  limpiarEspaciosFolio(valor: string) {
    this.filtro.folio = valor.replace(/\s+/g, '');
  }

  validarCaracteres(event: KeyboardEvent): void {
    const char = event.key;
    const regex = /^[\d/]$/;
    if (!regex.test(char)) event.preventDefault();
  }

  mostrarBoton(): boolean {
    const user = this.tokenService.getUserFromToken();
    if (user && (user.idSistemaPerfil === 7180 || user.idSistemaPerfil === 7181 || user.idSistemaPerfil === 7182)) {
      return true;
    } else {
      return false;
    }
  }

  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }



  private buildTablaDatos(registros: any[]): any[] {
    const tabla: any[] = [];

    for (const item of registros) {
      if (!item || !item.tipo) continue;

      switch (item.tipo) {
        case 'requerimiento': {
          const historialReq = item.historial || [];
          const ultimoEstadoReq = historialReq.length
            ? historialReq[historialReq.length - 1].cat_estado_requerimiento?.nombre || 'Sin estado'
            : 'Sin estado';

          tabla.push({
            id: item.idRequerimiento,
            folio: item.documento_acuerdo?.folio || 'Sin folio',
            tipo: 'Requerimiento',
            nombre: 'Requerimiento',
            fecha: item.created_at,
            estado: ultimoEstadoReq,
            fechaLimite: item.fechaLimite,
            datosOriginales: item
          });
          break;
        }

        case 'tramite': {
          const ultimo = item.ultimo_estado;
          const estadoNombre = ultimo?.cat_estado_tramite?.nombre || 'Sin estado';

          tabla.push({
            id: item.idTramite,
            folio: item.folio || 'Sin folio',
            tipo: 'tramite',
            nombre: item.cat_tramite?.nombre || 'Sin nombre',
            fecha: item.fechaRecepcion || item.created_at,
            estado: estadoNombre,
            datosOriginales: item
          });
          break;
        }

        case 'audiencia': {
          tabla.push({
            id: item.idAudiencia,
            folio: item.folio || 'Sin folio',
            tipo: 'Audiencia',
            nombre: item.title,
            fecha: item.fechaAudiencia || item.created_at,
            estado:
              item.ultimo_estado?.catalogo_estado_audiencia?.descripcion ||
              item.ultimo_estado?.descripcion ||
              'Sin estado',
            datosOriginales: item
          });
          break;
        }

        case 'acuerdo': {
          tabla.push({
            id: item.idAcuerdo,
            folio: item.folio || 'Sin folio',
            tipo: 'acuerdo',
            nombre: 'Acuerdo',
            fecha: item.fechaAcuerdo || item.created_at,
            estado: item.ultimo_estado?.cat_estado_acuerdo?.nombre || 'Sin estado',
            datosOriginales: item
          });
          break;
        }

        default:
          console.warn('Tipo de registro no reconocido:', item);
      }
    }

    return tabla;
  }

  getEstadoDescripcion(tramite: unknown): string | null {
    const i = tramite as { ultimo_estado?: { cat_estado_tramite?: { nombre?: string } } };
    return i.ultimo_estado?.cat_estado_tramite?.nombre ?? null;
  }

  getEstadoId(tramite: unknown): number | null {
    const i = tramite as { ultimo_estado?: { idCatEstadoTramite?: number, cat_estado_tramite?: { idCatEstadoTramite?: number } } };
    return i.ultimo_estado?.idCatEstadoTramite ?? i.ultimo_estado?.cat_estado_tramite?.idCatEstadoTramite ?? null;
  }

  getEstadoTag(tramite: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(tramite);
    switch (id) {
      case 0:
        return { severity: 'success', icon: 'pi pi-file-send' };
      case 1:
        return { severity: 'secondary', icon: 'pi pi-send' };
      case 2:
        return { severity: 'info', icon: 'pi pi-clock' };
      case 3:
        return { severity: 'success', icon: 'pi pi-check' };
      default:
        return { severity: 'secondary', icon: 'pi pi-question' };
    }
  }

      getDescripcionTramite(tramite: unknown): string | null {
    const i = tramite as { cat_tramite?: { nombre?: string } };
    return i.cat_tramite?.nombre ?? null;
  }

  getIdTramite(tramite: unknown): number | null {
    const i = tramite as { cat_tramite?: { idCatTramite?: number } };
    return i.cat_tramite?.idCatTramite ?? null;
  }

  getTagTramite(tramite: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getIdTramite(tramite);
    switch (id) {
      case 0:
        return { severity: 'secondary', icon: 'pi pi-file-pdf' };
      case 1:
        return { severity: 'warn', icon: 'pi pi-file-pdf' };
      case 2:
        return { severity: 'info', icon: 'pi pi-flag' };
      case 3:
        return { severity: 'success', icon: 'pi pi-file-pdf' };
      default:
        return { severity: 'warn', icon: 'pi pi-question' };
    }
  }

  items: MenuItem[] | undefined;

}

