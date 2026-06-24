
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ============================
// PrimeNG
// ============================
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';
// ============================
// App - shared
// ============================
import { Header } from '../../../shared/components/header/header';
import { Spinner } from '../../../shared/components/spinner/spinner';

// ============================
// App - feature
// ============================
import { DetalleDemandaResponse, ListadoTramitesResponse, ListarExpedientesResponse } from '../../interfaces/juicioenlinea.model';
import { JuicioService } from '../../services/juicioenlinea.service';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { ContadoresService } from '../../services/contadores.service';

@Component({
  selector: 'app-entrega-recepcion',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    // PrimeNG
    DatePickerModule,
    DialogModule,
    ButtonModule,
    ToastModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TableModule,
    SelectModule,
    InputTextModule,
    InputMaskModule,
    TooltipModule,
    MenuModule,
    BadgeModule,
    // Shared components
    Header,
    Spinner,
    ConfirmDialog
  ], templateUrl: './entrega-recepcion.html',
  styleUrl: './entrega-recepcion.css',
  providers: [ConfirmationService, MessageService]

})
export class EntregaRecepcion implements OnInit {

  // ===========================
  // UI options / state
  // ============================
  estadoOptions = [
    { label: 'Todo', value: 0 },
    { label: 'Enviado', value: 1 },
    { label: 'Asignado', value: 2 },
    { label: 'Finalizado', value: 3 },
  ];
  accionesItems: MenuItem[] = [
    {
      label: 'Recibir trámites',
      icon: 'pi pi-file-export',
      command: () => this.recibirSeleccionados()
    },
    // {
    //   label: 'Exportar seleccionados',
    //   icon: 'pi pi-download',
    //   command: () => this.exportarSeleccionados()
    // },
  ];

  tramitesSeleccionados: ListadoTramitesResponse[] = [];

  tramites = signal<ListadoTramitesResponse[]>([]);
  isLoading = signal(false);
  totalRecords = 0;        // ← total para que PrimeNG sepa cuántas páginas hay
  rowsPerPage = 10;        // ← rows actuales, se actualiza desde el evento lazy

  filtro: { folio: string; rangeDates: Date[] | ''; estado: number } = {
    folio: '',
    rangeDates: '',
    estado: 0,
  };


  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private contadoresService: ContadoresService

  ) { }

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    // Solo sincronizar filtros desde URL, la tabla disparará onLazyLoad automáticamente
    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
  }

  // ============================
  // Data / URL sync
  // ============================
  private sincronizarFiltrosDesdeURL(params: Record<string, string>): void {
    const estadoNum = params['estado'] ? Number(params['estado']) : 0;
    this.filtro.estado = Number.isFinite(estadoNum) ? estadoNum : 0;
    this.filtro.folio = params['folio'] || '';
    this.filtro.rangeDates =
      params['fechaInicio'] && params['fechaFinal']
        ? [
          this.parseDateFromString(params['fechaInicio']),
          this.parseDateFromString(params['fechaFinal']),
        ]
        : '';
  }
  // ── Evento lazy de PrimeNG ──────────────────────────────────────────
  // Se dispara al cargar, cambiar página y cambiar rows per page
  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.rowsPerPage;
    const first = event.first ?? 0;

    this.rowsPerPage = rows;
    const page = Math.floor(first / rows) + 1;

    this.actualizarURL(page);
    this.cargarDatos(page, rows);
  }

  private cargarDatos(page: number, perPage: number, onComplete?: () => void): void {
    this.isLoading.set(true);

    const params: Record<string, string | number> = { page, per_page: perPage };

    if (this.filtro.folio) params['folio'] = this.filtro.folio;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      params['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      params['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    if (this.filtro.estado > 0) params['estado'] = this.filtro.estado;

    this.juicioService.getTramitesPendientesRecibir(params).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.tramites.set(response.data);
        this.totalRecords = response.pagination?.total ?? 0;
        onComplete?.(); // ← ejecuta el callback si existe
      },
      error: (error) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'info',
          summary: 'Lo sentimos',
          detail: error.error?.message || 'Error al conectar con el servidor'
        });
      },
    });
  }
  // ============================
  // Actions (filters / paging)
  // ============================
  aplicarFiltros(): void {
    this.actualizarURL(1);
    this.cargarDatos(1, this.rowsPerPage);
  }
  private actualizarURL(page: number): void {
    const queryParams: Record<string, string | number | null> = {
      page,
      estado: this.filtro.estado > 0 ? this.filtro.estado : null,
      folio: this.filtro.folio || null,
      fechaInicio: null,
      fechaFinal: null,
    };

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      queryParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      queryParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  limpiarFiltros(): void {
    this.filtro = { estado: 0, rangeDates: '', folio: '' };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado: null, folio: null, fechaInicio: null, fechaFinal: null, page: 1 },
      queryParamsHandling: 'merge',
    });
    this.cargarDatos(1, this.rowsPerPage);
  }


  // ============================
  // Helpers
  // ============================
  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  detalleTramite(idTramite: number): void {
    this.router.navigate(['/juicioenlinea/tramites/detalle'], { state: { idTramite } });
  }

  detalleDemanda(idDemanda: number): void {
    this.router.navigate(['/juicioenlinea/demandas/detalle'], { state: { idDemanda } });
  }

  // ============================
  // Estado helpers for UI tags
  // ============================
  getEstadoDescripcion(tramite: unknown): string | null {
    const i = tramite as { ultimo_estado?: { cat_estado_tramite?: { nombre?: string } } };
    return i.ultimo_estado?.cat_estado_tramite?.nombre ?? null;
  }

  getEstadoId(tramite: unknown): number | null {
    const i = tramite as { ultimo_estado?: { cat_estado_tramite?: { idCatEstadoTramite?: number } } };
    return i.ultimo_estado?.cat_estado_tramite?.idCatEstadoTramite ?? null;
  }

  getEstadoTag(tramite: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(tramite);
    switch (id) {
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
        return { severity: 'info', icon: 'pi pi-flag' };``
      case 3:
        return { severity: 'success', icon: 'pi pi-file-pdf' };
      default:
        return { severity: 'secondary', icon: 'pi pi-question' };
    }
  }

  onSiguienteMovimientoTramite(idTramite: (string | number)[]): void {
    this.isLoading.set(true);
    const payload: any = {};
    if (idTramite.length) payload.idTramite = idTramite;

    this.juicioService.putSiguienteMovimientoTramite(payload).subscribe({
      next: (response) => {
        this.contadoresService.refrescar()
        if (response.success) {
          this.tramitesSeleccionados = [];
          this.cargarDatos(1, this.rowsPerPage, () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: response.message || 'Tramite(s) recibido(s) correctamente'
            });
          });
        } else {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'info',
            summary: 'Aviso',
            detail: response.message || 'No se pudo recibir el tramite'
          });
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al conectar con el servidor'
        });
      }
    });
  }

  recibirSeleccionados(): void {
    if (!this.tramitesSeleccionados.length) return;

    const idTramite = this.tramitesSeleccionados
      .map(e => e.idTramite)
      .filter(Boolean);

    if (!idTramite.length) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se encontraron IDs válidos' });
      return;
    }

    // Mostrar confirmación
    this.confirmationService.confirm({
      key: 'recibir',
      accept: () => this.onSiguienteMovimientoTramite(idTramite),
      reject: () => { }
    });
  }
}

