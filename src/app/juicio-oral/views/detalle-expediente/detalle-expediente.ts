import { Component, OnInit, signal } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { ListarExpedientesResponse, RegistroExpediente } from '../../interfaces/juicioenlinea.model';
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
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { PantallasService } from '../../services/pantallas.service';

@Component({
  selector: 'app-detalle-expediente',
  imports: [CommonModule, RouterModule, DatePickerModule, FormsModule, RadioButtonModule, ButtonModule, TagModule,
    IconFieldModule, InputIconModule, TableModule, SelectModule, InputTextModule, InputMaskModule, TooltipModule, Breadcrub],
  templateUrl: './detalle-expediente.html',
  styleUrl: './detalle-expediente.css',
})
export class DetalleExpediente {
  idExpediente: number | undefined;
  detalleExpediente: RegistroExpediente[] | null = null;
  expediente = signal<ListarExpedientesResponse | null>(null);
  tablaDatos = signal<any[]>([]);

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
    private pantallasService: PantallasService
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
        const data = response?.data ?? {};
        this.expediente.set(data.expediente || null);
        this.pagination = data.pagination || {
          current_page: 1,
          per_page: 5,
          total: 0,
          last_page: 1
        };
        const registros = Array.isArray(data.registros) ? data.registros.filter(Boolean) : [];
        this.detalleExpediente = registros;
        this.tablaDatos.set(this.buildTablaDatos(registros));
      },
      error: (error) => {
        console.error('Error al cargar el detalle:', error);
        this.detalleExpediente = null;
        this.expediente.set(null);
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
    this.closeDropdown();
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
    this.closeDropdown();
  }

  cambiarPagina(page: number): void {
    this.navigatePreservingState({ page }, { replaceUrl: true });
    this.cargarDatos(page);
  }

  verDetalle(item: any): void {
    if (item.tipo === 'Pre-registro') {
      this.router.navigate(['/juicioenlinea/demandas/detalle'], { state: { idInicio: item.id } });
    } else if (item.tipo === 'Requerimiento') {
      this.router.navigate(['/juicioenlinea/requerimientos/detalle'], { state: { idRequerimiento: item.id } });
    } else if (item.tipo === 'tramite') {
      const idTramite = item.datosOriginales.idTramite;
      this.router.navigate(['/tramites/ver/detalle'], { state: { idTramite } });
    } else if (item.tipo === 'Audiencia') {
      const idAudiencia = item.datosOriginales.idAudiencia;
      this.router.navigate(['/juicioenlinea/audiencias/detalle'], { state: { idAudiencia } });
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
    return this.pantallasService.tienePermiso('requerimiento/crear');
  }

  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private closeDropdown(): void {
    this.mostrarDropdown = false;
    const dropdown = document.getElementById('dropdownTimepicker');
    if (dropdown) {
      dropdown.classList.remove('show');
      dropdown.classList.add('hidden');
    }
  }

  private buildTablaDatos(registros: any[]): any[] {
    const tabla: any[] = [];

    for (const item of registros) {
      if (!item || !item.tipo) continue;

      switch (item.tipo) {
        case 'pre_registro': {
          tabla.push({
            id: item.idPreregistro,
            folio: item.folio || item.folioPreregistro || 'Sin folio',
            tipo: 'Pre-registro',
            nombre: 'Pre-registro',
            fecha: item.fechaHoraRecepcion || item.fechaCreada || item.created_at,
            estado: item.historial_estado?.length
              ? item.historial_estado[item.historial_estado.length - 1].estado?.descripcion ?? 'Sin estado'
              : 'Sin estado',
            datosOriginales: item
          });
          break;
        }

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
          const historialTram = item.historial || [];
          const ultimoEstadoTram = historialTram.length
            ? historialTram[historialTram.length - 1].cat_estado_tramite?.nombre || 'Sin estado'
            : 'Sin estado';

          tabla.push({
            id: item.idTramite,
            folio: item.folioOficio || 'Sin folio',
            tipo: 'tramite',
            nombre: item.cat_tramite?.nombre || 'Sin nombre',
            fecha: item.created_at,
            estado: ultimoEstadoTram,
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
            fecha: item.created_at,
            estado:
              item.ultimo_estado?.catalogo_estado_audiencia?.descripcion ||
              item.ultimo_estado?.descripcion ||
              'Sin estado',
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

  getEstadoDescripcion(inicio: any): string | null {
    if (inicio && typeof inicio.estado === 'string') {
      return inicio.estado;
    }
    if (inicio && inicio.ultimo_estado && inicio.ultimo_estado.estado && inicio.ultimo_estado.estado.descripcion) {
      return inicio.ultimo_estado.estado.descripcion;
    }
    return null;
  }

  getEstadoId(inicio: unknown): number | null {
    const i = inicio as { ultimo_estado?: { estado?: { idCatEstadoInicio?: number } } };
    return i.ultimo_estado?.estado?.idCatEstadoInicio ?? null;
  }

  getEstadoTag(inicio: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const descripcion = this.getEstadoDescripcion(inicio);

    if (
      descripcion === 'Finalizado' ||
      descripcion === 'Aceptado' ||
      descripcion === 'Aceptada' ||
      descripcion === 'Finalizada' ||
      descripcion === 'Notificada' ||
      descripcion === 'Notificado' ||
      descripcion === 'Enviado' ||
      descripcion === 'Asignado'
    ) {
      return { severity: 'success', icon: 'pi pi-check' };
    }
    if (descripcion === 'Expirado') {
      return { severity: 'info', icon: 'pi pi-clock' };
    }
    if (
      descripcion === 'Cancelado' ||
      descripcion === 'Rechazado' ||
      descripcion === 'Rechazada' ||
      descripcion === 'Cancelada'
    ) {
      return { severity: 'warn', icon: 'pi pi-exclamation-triangle' };
    }
    return { severity: 'secondary' };
  }
}