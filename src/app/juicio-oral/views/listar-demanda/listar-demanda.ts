
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

// ============================
// App - shared
// ============================
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { Spinner } from '../../../shared/components/spinner/spinner';

// ============================
// App - feature
// ============================
import { ListadoIniciosCreados } from '../../interfaces/juicioenlinea.model';
import { JuicioService } from '../../services/juicioenlinea.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-listar-demanda',
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

    // Shared components
    Breadcrub,
  ],
  templateUrl: './listar-demanda.html',
  styleUrl: './listar-demanda.css',
  providers: [MessageService],
})
export class ListarDemanda implements OnInit {
  // ============================
  // UI options / state
  // ============================
  estadoOptions = [
    { label: 'Todo', value: 0 },
    { label: 'Enviado', value: 1 },
    { label: 'Asignado', value: 2 },
    { label: 'Finalizado', value: 3 },
  ];

  inicios: ListadoIniciosCreados[] = [];
  isLoading = false;

  filtro: { folio: string; rangeDates: Date[] | ''; estado: number } = {
    folio: '',
    rangeDates: '',
    estado: 0,
  };

  pagination = {
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  };

  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
    const page = params['page'] ? +params['page'] : 1;
    this.cargarDatos(page);
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

  private cargarDatos(page: number): void {
    this.isLoading = true;

    const requestParams: Record<string, string | number> = {
      page,
      per_page: 5,
    };

    if (this.filtro.folio) requestParams['folio'] = this.filtro.folio;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    if (this.filtro.estado > 0) requestParams['estado'] = this.filtro.estado;

    this.juicioService.getListadoInicios(requestParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.inicios = response?.data ?? [];
        this.pagination = response.pagination;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error:', error);
        this.cdr.markForCheck();
      },
    });
  }

  // ============================
  // Actions (filters / paging)
  // ============================
  aplicarFiltros(): void {
    const queryParams: Record<string, string | number | null> = {
      page: 1,
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
    });

    this.cargarDatos(1);
  }

  limpiarFiltros(): void {
    this.filtro = { estado: 0, rangeDates: '', folio: '' };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado: null, folio: null, fechaInicio: null, fechaFinal: null, page: 1 },
      queryParamsHandling: 'merge',
    });

    this.cargarDatos(1);
  }

  cambiarPagina(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    this.cargarDatos(page);
  }

  // ============================
  // Helpers
  // ============================
  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  detalle(idInicio: number) {
    this.router.navigate(['/juicioenlinea/demandas/detalle'], { state: { idInicio } });
  }

  onRedirigirCrear() {
    this.router.navigate(['/juicioenlinea/demandas/crear']);
  }

  // ============================
  // Estado helpers for UI tags
  // ============================
  getEstadoDescripcion(inicio: unknown): string | null {
    const i = inicio as { historial_estado?: Array<{ estado?: { descripcion?: string } }> };
    return i.historial_estado?.[0]?.estado?.descripcion ?? null;
  }

  getEstadoId(inicio: unknown): number | null {
    const i = inicio as { historial_estado?: Array<{ estado?: { idCatEstadoInicio?: number } }> };
    return i.historial_estado?.[0]?.estado?.idCatEstadoInicio ?? null;
  }

  getEstadoTag(inicio: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(inicio);
    switch (id) {
      case 1:
        return { severity: 'success', icon: 'pi pi-check' };
      case 2:
        return { severity: 'info', icon: 'pi pi-clock' };
      case 3:
        return { severity: 'warn', icon: 'pi pi-exclamation-triangle' };
      default:
        return { severity: 'secondary' };
    }
  }
}
