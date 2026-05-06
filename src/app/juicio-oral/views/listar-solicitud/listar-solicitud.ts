import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// ============================
// PrimeNG
// ============================
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

// ============================
// App – shared
// ============================
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { Spinner } from '../../../shared/components/spinner/spinner';

// ============================
// App – feature
// ============================
import { SolicitudesGrabacionesResponse } from '../../interfaces/juicioenlinea.model';
import { JuicioService } from '../../services/juicioenlinea.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/auth/service/auth.service';
import { PantallasService } from '../../services/pantallas.service';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-listar-solicitud',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputMaskModule,
    InputTextModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    FileUploadModule,
    // Shared
    Breadcrub,
    Spinner,
    PdfDialog
],
  templateUrl: './listar-solicitud.html',
  styleUrl: './listar-solicitud.css',
  providers: [MessageService, ConfirmationService],
})
export class ListarSolicitud implements OnInit {
  // ============================
  // UI options / state
  // ============================
  estadoOptions = [
    { label: 'Todo', value: '' },
    { label: 'Pendiente', value: '1' },
    { label: 'Aceptada', value: '2' },
    { label: 'Rechazada', value: '3' },
  ];

  solicitudes: SolicitudesGrabacionesResponse[] = [];
  isLoading = false;

  filtro: { expediente: string; rangeDates: Date[] | ''; estado: string } = {
    expediente: '',
    rangeDates: '',
    estado: '',
  };

  totalRecords = 0;
  rowsPerPage = 10;

  // Modal PDF
  visiblePdfModal = false;
  documentoUrl: SafeUrl | null = null;
  solicitudSeleccionada: SolicitudesGrabacionesResponse | null = null;
  esPrimerEstado = false;

  // Modal acción
  visibleModal = false;
  anexoForm!: FormGroup;
  formEnviado = false;
  estadoAccion = 0;
  selectedIdSolicitud: number | null = null;

  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private juicioService: JuicioService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private pantallasService: PantallasService

  ) { }

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    this.anexoForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.maxLength(250)]],
      documento: [null, Validators.required],
    });

    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
  }

  // ============================
  // Data / URL sync
  // ============================
  private sincronizarFiltrosDesdeURL(params: Record<string, string>): void {
    this.filtro.estado = params['estado'] || '';
    this.filtro.expediente = params['expediente'] || '';
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

    if (this.filtro.expediente) requestParams['expediente'] = this.filtro.expediente;
    if (this.filtro.estado) requestParams['estado'] = this.filtro.estado;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.juicioService.getSolicitudesAudiencia(requestParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.solicitudes = response.data;
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
      estado: this.filtro.estado || null,
      expediente: this.filtro.expediente || null,
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
    this.filtro = { estado: '', rangeDates: '', expediente: '' };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado: null, expediente: null, fechaInicio: null, fechaFinal: null, page: 1 },
      queryParamsHandling: 'merge',
    });

    this.cargarDatos(1, this.rowsPerPage);
  }

  cambiarPagina(page: number): void {
    // Ya no es necesario, lo maneja onLazyLoad
  }

  // ============================
  // Modal PDF
  // ============================
  openModal(idDocumento: number, solicitud: SolicitudesGrabacionesResponse, esPrimer: boolean): void {
    this.isLoading = true;
    this.solicitudSeleccionada = solicitud;
    this.esPrimerEstado = esPrimer;

    this.juicioService.getDocumento(idDocumento).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.data?.file) {
          this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/pdf;base64,${response.data.file}`
          );
          this.visiblePdfModal = true;
        } else {
          console.error('No se encontró contenido base64 para el documento');
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al obtener el documento:', error);
        this.cdr.markForCheck();
      },
    });
  }

  // ============================
  // Modal acción (Aceptar / Denegar)
  // ============================
  showModalAccion(estado: number, idSolicitud: number): void {
    this.estadoAccion = estado;
    this.selectedIdSolicitud = idSolicitud;
    this.visibleModal = true;
  }

resetAnexoForm(): void {
    this.anexoForm.reset();
    this.formEnviado = false;
    this.visibleModal = false;
}

onFileSelectedSolicitud(event: any): void {
    const file = event.files[0];
    if (file) {
        this.anexoForm.patchValue({ documento: file });
        this.anexoForm.get('documento')?.markAsTouched();
        this.anexoForm.get('documento')?.updateValueAndValidity();
    }
}
  confirmSolicitud(event: Event): void {
    this.formEnviado = true;
    if (!this.anexoForm.valid) return;

    this.confirmationService.confirm({
      key: 'actualizar',
      target: event.target as EventTarget,
      accept: () => this.actualizarSolicitud(),
      reject: () => { },
    });
  }

  private actualizarSolicitud(): void {
    if (!this.selectedIdSolicitud) return;
    this.isLoading = true;

    const formData = new FormData();
    formData.append('observaciones', (this.anexoForm.get('observaciones')?.value ?? '').toUpperCase());
    formData.append('documento', this.anexoForm.get('documento')?.value);
    formData.append('estado', this.estadoAccion.toString());

    this.juicioService.updateSolicitudesAudiencia(this.selectedIdSolicitud, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'info', summary: 'Solicitud actualizada', detail: 'El estado de la solicitud cambió' });
        this.cargarDatos(1, this.rowsPerPage);
        this.resetAnexoForm();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        const apiMsg = error?.error?.message || error?.message || 'No se completó la solicitud. Contacte a soporte.';
        this.messageService.add({ severity: 'warn', summary: 'Lo sentimos', detail: apiMsg });
        this.cdr.markForCheck();
      },
    });
  }

  // ============================
  // Navigation
  // ============================
  detalleAudiencia(idAudiencia: number): void {
    this.router.navigate(['/juicioenlinea/audiencias/detalle'], { state: { idAudiencia } });
  }

  // ============================
  // Helpers
  // ============================
  mostrarBoton(): boolean {
    return this.pantallasService.tienePermiso('requerimiento/crear');
  }

  getError(controlName: string): string {
    const control = this.anexoForm.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('pattern')) return 'Formato inválido';
    if (control?.hasError('maxlength')) return 'Se excedió el número máximo de caracteres';
    return '';
  }

  shouldShowError(controlName: string): boolean {
    const control = this.anexoForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.formEnviado) : false;
  }

  getEstadoTag(solicitud: SolicitudesGrabacionesResponse): { severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary'; icon?: string } {
    const id = solicitud.ultimo_estado?.estado?.idCatEstadoSolicitud;
    switch (id) {
      case 1: return { severity: 'warn', icon: 'pi pi-clock' };
      case 2: return { severity: 'success', icon: 'pi pi-check' };
      case 3: return { severity: 'danger', icon: 'pi pi-times' };
      default: return { severity: 'secondary' };
    }
  }

  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
