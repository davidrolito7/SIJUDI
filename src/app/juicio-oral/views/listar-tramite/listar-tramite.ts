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
import { Header } from '../../../shared/components/header/header';
import { Spinner } from '../../../shared/components/spinner/spinner';

// ============================
// App - feature
// ============================
import { JuicioService } from '../../services/juicioenlinea.service';
import { Juzgado, ListadoTramitesResponse } from '../../interfaces/juicioenlinea.model';
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
    Header,
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

  tramites: ListadoTramitesResponse[] = [];
  isLoading = false;
  visible = false;

  filtro: { folio: string; rangeDates: Date[] | ''; tipo: string } = {
    folio: '',
    rangeDates: '',
    tipo: '',
  };

  totalRecords = 0;
  rowsPerPage = 10;

  expedienteForm!: FormGroup;
  juzgados: Juzgado[] = [];

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

  ) { }

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    this.expedienteForm = this.fb.group({
      folio: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
      expediente: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
      juzgado: [null, [Validators.required]]

    });

    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);

    //this.cargarJuzgados();

    //this.cargarJuzgados();

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
    if (this.filtro.tipo) requestParams['tipo'] = this.filtro.tipo;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.juicioService.getListarTramites(requestParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.tramites = response.data ?? [];
        this.totalRecords = response.pagination?.total ?? 0;
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
    this.actualizarURL(1);
    this.cargarDatos(1, this.rowsPerPage);
  }

  private actualizarURL(page: number): void {
    const queryParams: Record<string, string | number | null> = {
      page,
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
      replaceUrl: true
    });
  }

  limpiarFiltros(): void {
    this.filtro = { folio: '', rangeDates: '', tipo: '' };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { folio: null, tipo: null, fechaInicio: null, fechaFinal: null, page: 1 },
      queryParamsHandling: 'merge',
    });

    this.cargarDatos(1, this.rowsPerPage);
  }

  cambiarPagina(page: number): void {
    // Ya no es necesario, lo maneja onLazyLoad
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
            this.router.navigate(['/juicioenlinea/tramites/crear'], {
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

  cargarJuzgados() {
    this.juicioService.getJuzgados().subscribe({
      next: (juzgados) => {
        this.juzgados = juzgados;
        console.log('Juzgados:', juzgados);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}

