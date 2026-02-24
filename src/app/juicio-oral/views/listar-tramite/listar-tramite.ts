import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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
import { TooltipModule } from 'primeng/tooltip';

// ============================
// App - shared
// ============================
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { Spinner } from '../../../shared/components/spinner/spinner';

// ============================
// App - feature
// ============================
import { JuicioService } from '../../services/juicioenlinea.service';
import { ListadoTramites } from '../../interfaces/juicioenlinea.model';
import { AuthService } from '../../../core/auth/service/auth.service';
import { PantallasService } from '../../services/pantallas.service';

@Component({
  selector: 'app-listar-tramite',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    ButtonModule,
    DatePickerModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputMaskModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    // Shared
    Breadcrub,
    Spinner,
  ],
  templateUrl: './listar-tramite.html',
  styleUrl: './listar-tramite.css',
  providers: [MessageService],
})
export class ListarTramite implements OnInit {

  // ============================
  // UI options / state
  // ============================
  tipoOptions = [
    { label: 'Todo', value: '' },
    { label: 'Oficios', value: '1' },
    { label: 'Promociones', value: '2' },
  ];

  tramites: ListadoTramites[] = [];
  isLoading = false;
  visible = false;

  filtro: { folio: string; rangeDates: Date[] | ''; tipo: string } = {
    folio: '',
    rangeDates: '',
    tipo: '',
  };

  pagination = {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };

  expedienteForm!: FormGroup;

  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
        private pantallasService: PantallasService
    
  ) {}

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    this.expedienteForm = this.fb.group({
      folio: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
      expediente: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
    });

    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
    const page = params['page'] ? +params['page'] : 1;
    this.cargarDatos(page);
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

  private cargarDatos(page: number): void {
    this.isLoading = true;

    const requestParams: Record<string, string | number> = {
      page,
      per_page: 10,
    };

    if (this.filtro.folio) requestParams['folio'] = this.filtro.folio;
    if (this.filtro.tipo) requestParams['tipo'] = this.filtro.tipo;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.juicioService.getListarTramites(requestParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.tramites = response.data ?? [];
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
      folio: this.filtro.folio || null,
      tipo: this.filtro.tipo || null,
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
    this.filtro = { folio: '', rangeDates: '', tipo: '' };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { folio: null, tipo: null, fechaInicio: null, fechaFinal: null, page: 1 },
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
  // Modal expediente
  // ============================
  abrirModal(): void {
    this.visible = true;
    this.expedienteForm.reset();
  }

  cerrarModal(): void {
    this.visible = false;
    this.expedienteForm.reset();
  }

  busqueda(): void {
    if (this.expedienteForm.invalid) return;

    this.isLoading = true;
    const formData = new FormData();
    Object.keys(this.expedienteForm.controls).forEach((key) => {
      const value = this.expedienteForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    this.juicioService.busquedaExpediente(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        const expediente = response?.data;

        if (expediente && String(expediente.idExpediente).trim() !== '') {
          this.messageService.add({
            severity: 'success',
            summary: 'Confirmado',
            detail: 'Expediente encontrado correctamente',
          });

          setTimeout(() => {
            this.router.navigate(['/tramites/crear'], {
              state: { idExpediente: expediente.idExpediente },
            });
            this.cerrarModal();
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'No encontrado',
            detail: 'No se encontró el expediente',
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || 'Error al buscar el expediente',
        });
      },
    });
  }

  // ============================
  // Helpers
  // ============================
  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  detalle(idTramite: number): void {
    this.router.navigate(['/juicioenlinea/tramites/detalle'], { state: { idTramite } });
  }

  mostrarBoton(): boolean {
    return this.pantallasService.tienePermiso('demandas/crear');
  }

  get titulo(): string {
    return this.mostrarBoton() ? 'enviados' : 'recibidos';
  }

  // ============================
  // Estado helpers para UI tags
  // ============================
getEstadoDescripcion(tramite: unknown): string | null {
  const t = tramite as { historial?: Array<{ cat_estado_tramite?: { nombre?: string } }> };
  const historial = t.historial;
  if (!historial || historial.length === 0) return null;
  return historial[historial.length - 1]?.cat_estado_tramite?.nombre ?? null;
}

  getEstadoId(tramite: unknown): number | null {
    const t = tramite as { historial?: Array<{ idCatEstadoTramite?: number }> };
    const historial = t.historial;
    if (!historial || historial.length === 0) return null;
    return historial[historial.length - 1]?.idCatEstadoTramite ?? null;
  }

  getEstadoTag(tramite: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(tramite);
    switch (id) {
      case 1:
        return { severity: 'info', icon: 'pi pi-send' };
      case 2:
        return { severity: 'success', icon: 'pi pi-check' };
      case 10002:
        return { severity: 'warn', icon: 'pi pi-file-edit' };
      default:
        return { severity: 'secondary' };
    }
  }
}