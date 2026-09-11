import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

// Shared
import { Spinner } from '../../../shared/components/spinner/spinner';

// Feature
import { JuicioService } from '../../services/juicioenlinea.service';
import { ListadoAcuerdosResponse } from '../../interfaces/juicioenlinea.model';

@Component({
  selector: 'app-listar-acuerdos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    // PrimeNG
    ButtonModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    // Shared

    Spinner,
  ],
  templateUrl: './listar-acuerdo.html',
  styleUrl: './listar-acuerdo.css',
  providers: [MessageService],
})
export class ListarAcuerdos implements OnInit {

  // ============================
  // UI options / state
  // ============================
  tipoOptions = [
    { label: 'Todo', value: '' },
    { label: 'Oficios', value: '1' },
    { label: 'Promociones', value: '2' },
  ];

  acuerdos: ListadoAcuerdosResponse[] = [];
  isLoading = false;

  filtro: { folio: string; rangeDates: Date[] | ''; tipo: string } = {
    folio: '',
    rangeDates: '',
    tipo: '',
  };

  totalRecords = 0;
  rowsPerPage = 10;

  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) {}

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
  }

  // ============================
  // Data / URL sync
  // ============================
  private sincronizarFiltrosDesdeURL(params: Record<string, string>): void {
    this.filtro.folio = params['folio'] || '';
    this.filtro.tipo = params['tipo'] || '';
    this.filtro.rangeDates =
      params['fechaInicio'] && params['fechaFinal']
        ? [
            this.parseDateFromString(params['fechaInicio']),
            this.parseDateFromString(params['fechaFinal']),
          ]
        : '';
  }

  onLazyLoad(event: any): void {
    const rows = event.rows ?? this.rowsPerPage;
    const first = event.first ?? 0;

    this.rowsPerPage = rows;
    const page = Math.floor(first / rows) + 1;

    this.actualizarURL(page);
    this.cargarDatos(page, rows);
  }

  private cargarDatos(page: number, perPage: number): void {
    this.isLoading = true;

    const requestParams: Record<string, string | number> = {
      page,
      per_page: perPage,
    };

    if (this.filtro.folio) requestParams['folio'] = this.filtro.folio;
    if (this.filtro.tipo)  requestParams['tipo']  = this.filtro.tipo;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal']  = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.juicioService.getListarAcuerdos(requestParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.acuerdos = response.data;
        this.totalRecords = response.pagination?.total ?? 0;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar acuerdos:', error);
        this.cdr.markForCheck();
      },
    });
  }

  // ============================
  // Actions
  // ============================
  aplicarFiltros(): void {
    this.actualizarURL(1);
    this.cargarDatos(1, this.rowsPerPage);
  }

  private actualizarURL(page: number): void {
    const queryParams: Record<string, string | number | null> = {
      page,
      tipo:       this.filtro.tipo  || null,
      folio:      this.filtro.folio || null,
      fechaInicio: null,
      fechaFinal:  null,
    };

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      queryParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      queryParams['fechaFinal']  = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  limpiarFiltros(): void {
    this.filtro = { tipo: '', rangeDates: '', folio: '' };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: null, folio: null, fechaInicio: null, fechaFinal: null, page: 1 },
      queryParamsHandling: 'merge',
    });

    this.cargarDatos(1, this.rowsPerPage);
  }

  cambiarPagina(page: number): void {
    // Ya no es necesario, lo maneja onLazyLoad
  }

  detalle(idAcuerdo: number): void {
    this.router.navigate(['/juicioenlinea/acuerdos/detalle'], { state: { idAcuerdo } });
  }

  // ============================
  // Helpers
  // ============================
  limpiarEspaciosFolio(valor: string): void {
    this.filtro.folio = valor.replace(/\s+/g, '');
  }

  validarCaracteres(event: KeyboardEvent): void {
    const regex = /^[\d/]$/;
    if (!regex.test(event.key)) event.preventDefault();
  }

  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // ============================
  // Estado helpers for UI tags
  // ============================
  getEstadoDescripcion(acuerdo: unknown): string | null {
    const a = acuerdo as { ultimo_estado?: { estado?: { descripcion?: string } } };
    return a.ultimo_estado?.estado?.descripcion ?? null;
  }

  getEstadoId(acuerdo: unknown): number | null {
    const a = acuerdo as { ultimo_estado?: { estado?: { idCatEstadoAcuerdo?: number } } };
    return a.ultimo_estado?.estado?.idCatEstadoAcuerdo ?? null;
  }

  getEstadoTag(acuerdo: unknown): { severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(acuerdo);
    switch (id) {
      case 1: return { severity: 'success', icon: 'pi pi-check' };
      case 2: return { severity: 'danger',  icon: 'pi pi-times' };
      case 3: return { severity: 'warn',    icon: 'pi pi-exclamation-triangle' };
      case 4: return { severity: 'info',    icon: 'pi pi-clock' };
      default: return { severity: 'secondary' };
    }
  }
}

