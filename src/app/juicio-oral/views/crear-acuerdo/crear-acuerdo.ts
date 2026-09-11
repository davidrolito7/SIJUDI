import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Shared
import { Spinner } from '../../../shared/components/spinner/spinner';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

// Feature
import { DetalleExpedienteResponse } from '../../interfaces/juicioenlinea.model';
import { JuicioService } from '../../services/juicioenlinea.service';

type TipoMiniAcuerdo = 'inicio' | 'tramiteNormal' | 'tramiteOficioso';

interface DocumentoPendiente {
  idDocumento: number;
  nombre: string;
  documento: string;
}

interface TramitePendiente {
  idTramite: number;
  idCatTramite: number;
  folio: string;
  tipoTramite: string;
  sintesis: string;
  fechaRecepcion: string;
  documentos: DocumentoPendiente[];
}

// Fila fija "Oficio" en la tabla de auto de trámite
const OFICIO_ROW: TramitePendiente = {
  idTramite: -1,
  idCatTramite: -1,
  folio: 'Oficio',
  tipoTramite: 'Tramite de oficio',
  sintesis: 'Tramite generado por el juzgado',
  fechaRecepcion: '',
  documentos: [],
};

@Component({
  selector: 'app-crear-acuerdo',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    TableModule,
    TextareaModule,
    ToastModule,
    TooltipModule,
    InputGroupModule,
    InputGroupAddonModule,
    TagModule,
    SelectModule,
    Spinner,
    ConfirmDialog,
    ConfirmDialogModule,
  ],
  templateUrl: './crear-acuerdo.html',
  styleUrl: './crear-acuerdo.css',
  providers: [ConfirmationService, MessageService],
})
export class CrearAcuerdo implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fileInputOficioso') fileInputOficioso!: ElementRef;

  // ============================
  // State
  // ============================
  isLoading = signal<boolean>(false);
  expediente: DetalleExpedienteResponse | null = null;
  idExpediente: number | undefined;

  acuerdo!: FormGroup;
  tramiteDemanda: TramitePendiente | null = null;
  promocionesPendientes: TramitePendiente[] = [];

  // Fila fija oficio expuesta al template
  readonly oficioRow = OFICIO_ROW;

  clasificacionOptions = [
    { label: 'Admite', value: 'admite' },
    { label: 'Requiere', value: 'requiere' },
    { label: 'Desecha', value: 'desecha' },
  ];

  // Archivo subido
  nombreArchivo = '';
  uploadFile: File | null = null;
  archivoUrl: string | null = null;

  // Visor PDF
  visibleDocumento = false;
  documentoUrl: SafeUrl | null = null;

  private readonly expedienteEstatico = {
    success: true,
    status: 200,
    data: {
      idExpediente: 4,
      NumExpediente: '0004/2026',
      idCatJuzgado: '81',
      fechaResponse: '2026-05-12 09:42:21.080',
      idDemanda: '5',
      idSubArea: '1004',
      juzgado: {
        IdCatJuzgado: 81,
        CveJuzgado: 'JM28',
        Descripcion: 'MIXTO DE 1ª INST. DE ZIMATLAN',
        Tipo: 'M',
        'Activo ': '1',
      },
      demanda: {
        idDemanda: 5,
        folio: '0004/2026',
        fechaHoraRecepcion: '2026-05-12 09:42:18.671',
        descripcionDemanda: 'DEMANDA DE JUICIO SUCESRIO TESTAMENTAL',
        cat_via_materia: {
          idCatViaMateria: 2,
          idCatTipoVia: '1',
          idCatMateria: '2',
          activo: '1',
          cat_materia: { IdCatMateria: 2, Descripcion: 'FAMILIAR', ClaveMateria: 'F', activo: '1' },
          cat_via: { idCatTipoVia: 1, descripcion: 'ACTO PREJUDICIAL', modelo: '1', activo: '1' },
        },
      },
      tramites: [
        {
          idTramite: 5, idCatTramite: '3', folio: '0004/2026',
          sintesis: 'DEMANDA DE JUICIO SUCESRIO TESTAMENTAL',
          observaciones: 'Tramite generado automaticamente por la presentacion de la demanda',
          idExpediente: '4', fechaRecepcion: '2026-05-12T15:42:20.000000Z', tipoEntidad: 'Demanda',
          cat_tramite: { idCatTramite: 3, nombre: 'Escrito de demanda', activo: '1' },
          ultimo_estado: { idCatEstadoTramite: 3, cat_estado_tramite: { idCatEstadoTramite: 3, nombre: 'En tramite', activo: '1' } },
          documentos: [{ idDocumento: 7, nombre: 'documento de prueba.pdf', documento: 'SitiosWeb/JuicioLinea/DemandaS/2026/0004/doc.pdf', activo: '1', idTramite: '5' }],
          movimientos: [],
        },
        {
          idTramite: 6, idCatTramite: '2', folio: '0005/2026',
          sintesis: 'PROMOCION PARA CAMBIO DE DOMICILIO',
          observaciones: 'PUES NADA POR EL MOMENTO',
          idExpediente: '4',
          fechaRecepcion: '2026-05-12T15:50:02.000000Z',
          tipoEntidad: 'Tramite',
          cat_tramite: { idCatTramite: 2, nombre: 'Promocion', activo: '1' },
          ultimo_estado: { idCatEstadoTramite: 3, cat_estado_tramite: { idCatEstadoTramite: 3, nombre: 'En tramite', activo: '1' } },
          documentos: [{ idDocumento: 9, nombre: 'PROMOCION', documento: 'SitiosWeb/JuicioLinea/JUZGADOS/2026/0004/TRAMITES/prom1.pdf', activo: '1', idTramite: '6' }],
          movimientos: [],
        },
        {
          idTramite: 7, idCatTramite: '2', 
          folio: '0006/2026',
          sintesis: 'CAMBIO DE DATOS PERSONALES DE CONTACTO',
          observaciones: 'PUES NADA POR EL MOMENTO',
          idExpediente: '4',
          fechaRecepcion: '2026-05-12T15:50:02.000000Z',
          tipoEntidad: 'Tramite',
          cat_tramite: { idCatTramite: 2, nombre: 'Promocion', activo: '1' },
          ultimo_estado: { idCatEstadoTramite: 3, cat_estado_tramite: { idCatEstadoTramite: 3, nombre: 'En tramite', activo: '1' } },
          documentos: [{ idDocumento: 9, nombre: 'PROMOCION', documento: 'SitiosWeb/JuicioLinea/JUZGADOS/2026/0004/TRAMITES/prom1.pdf', activo: '1', idTramite: '6' }],
          movimientos: [],
        },
        {
          idTramite: 8,
          idCatTramite: '4',
          folio: '0087/2026',
          sintesis: 'OFICIO GENERADO POR EL JUZGADO',
          observaciones: '',
          idExpediente: '4',
          fechaRecepcion: '2026-05-12T15:50:02.000000Z',
          tipoEntidad: 'Oficio',
          cat_tramite: { idCatTramite: 4, nombre: 'Oficio', activo: '1' },
          ultimo_estado: { idCatEstadoTramite: 3, cat_estado_tramite: { idCatEstadoTramite: 3, nombre: 'En tramite', activo: '1' } },
          documentos: [{ idDocumento: 9, nombre: 'PROMOCION', documento: 'SitiosWeb/JuicioLinea/JUZGADOS/2026/0004/TRAMITES/prom1.pdf', activo: '1', idTramite: '6' }],
          movimientos: [],
        },
      ],
      requerimientos: [],
      acuerdos: [],
      audiencias: [],
    },
  };

  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private fb: FormBuilder,
    private juicioService: JuicioService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
  ) { }

  private readonly requiredArrayValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return Array.isArray(value) && value.length > 0 ? null : { required: true };
  };

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    this.acuerdo = this.fb.group({
      sintesis: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      observaciones: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      tramiteOficioso: [false],
      autoInicio: this.fb.group({
        idTramite: [null],
        idDocumento: [null],
        tipoAcuerdo: ['inicio', Validators.required],
        clasificacion: [null, Validators.required],
      }),
      autoTramite: this.fb.group({
        tipoAcuerdo: ['tramiteNormal', Validators.required],
        tramitesSeleccionados: [[], this.requiredArrayValidator],
      }),
      documento: [null, Validators.required],
    });

    this.acuerdo.get('tramiteOficioso')?.valueChanges.subscribe((esOficioso: boolean) => {
      this.configurarTramiteOficioso(esOficioso);
    });

    this.cargarExpedienteEstatico();
  }

  private cargarExpedienteEstatico(): void {
    this.expediente = this.expedienteEstatico.data as unknown as DetalleExpedienteResponse;
    this.idExpediente = this.expediente.idExpediente;
    this.crearTramitesPendientes();
  }

  // ============================
  // Getters
  // ============================
  get autoInicioForm(): FormGroup {
    return this.acuerdo.get('autoInicio') as FormGroup;
  }

  get autoTramiteForm(): FormGroup {
    return this.acuerdo.get('autoTramite') as FormGroup;
  }

  get esTramiteOficioso(): boolean {
    return !!this.acuerdo.get('tramiteOficioso')?.value;
  }

  get tramitesSeleccionadosCount(): number {
    return (this.autoTramiteForm.get('tramitesSeleccionados')?.value ?? []).length;
  }
  get allTramitesSelected(): boolean {
    const seleccionados: number[] = this.autoTramiteForm.get('tramitesSeleccionados')?.value ?? [];
    return this.promocionesPendientes.length > 0 && seleccionados.length === this.promocionesPendientes.length;
  }

  // ============================
  // Build tramites
  // ============================
  private crearTramitesPendientes(): void {
    const tramites = (this.expediente?.tramites ?? []).map((tramite: any) => ({
      idTramite: Number(tramite.idTramite),
      idCatTramite: Number(tramite.idCatTramite ?? tramite.cat_tramite?.idCatTramite),
      folio: tramite.folio,
      tipoTramite: tramite.cat_tramite?.nombre ?? '',
      sintesis: tramite.sintesis ?? '',
      fechaRecepcion: tramite.fechaRecepcion,
      documentos: (tramite.documentos ?? []).map((doc: any) => ({
        idDocumento: Number(doc.idDocumento),
        nombre: doc.nombre,
        documento: doc.documento,
      })),
    }));

    this.tramiteDemanda = tramites.find(t => t.idCatTramite === 3) ?? null;
    this.promocionesPendientes = tramites.filter(t => t.idCatTramite === 2 || t.idCatTramite === 4);

    const docDemanda = this.tramiteDemanda?.documentos?.[0];
    this.autoInicioForm.patchValue({
      idTramite: this.tramiteDemanda?.idTramite ?? null,
      idDocumento: docDemanda?.idDocumento ?? null,
      tipoAcuerdo: 'inicio',
    });
  }

  private configurarTramiteOficioso(esOficioso: boolean): void {
    const tramitesCtrl = this.autoTramiteForm.get('tramitesSeleccionados');
    const tipoCtrl = this.autoTramiteForm.get('tipoAcuerdo');
    const documentoCtrl = this.acuerdo.get('documento');
    const autoInicioClasCtrl = this.autoInicioForm.get('clasificacion');

    if (esOficioso) {
      tipoCtrl?.setValue('tramiteOficioso');
      tramitesCtrl?.setValue([]);
      tramitesCtrl?.clearValidators();
      autoInicioClasCtrl?.clearValidators();
      this.quitarArchivo();
      documentoCtrl?.setValidators([Validators.required]); // oficioso también sube auto
    } else {
      tipoCtrl?.setValue('tramiteNormal');
      tramitesCtrl?.setValidators([this.requiredArrayValidator]);
      autoInicioClasCtrl?.setValidators([Validators.required]);
      documentoCtrl?.setValidators([Validators.required]);
    }

    tramitesCtrl?.updateValueAndValidity();
    autoInicioClasCtrl?.updateValueAndValidity();
    documentoCtrl?.updateValueAndValidity();
  }

  // ============================
  // Selección tabla auto de tramite
  // ============================
  toggleTramiteRow(tramite: TramitePendiente): void {
    this.togglePromocion(tramite);
  }

  toggleSelectAllTramites(event: any): void {
    const control = this.autoTramiteForm.get('tramitesSeleccionados');
    if (event.checked) {
      control?.setValue(this.promocionesPendientes.map(p => p.idTramite));
    } else {
      control?.setValue([]);
    }
    control?.markAsTouched();
  }

  togglePromocion(tramite: TramitePendiente): void {
    const control = this.autoTramiteForm.get('tramitesSeleccionados');
    const seleccionados = [...(control?.value ?? [])] as number[];
    const index = seleccionados.indexOf(tramite.idTramite);

    if (index >= 0) {
      seleccionados.splice(index, 1);
    } else {
      seleccionados.push(tramite.idTramite);
    }

    control?.setValue(seleccionados);
    control?.markAsTouched();
  }

  isPromocionSelected(idTramite: number): boolean {
    const seleccionados: number[] = this.autoTramiteForm.get('tramitesSeleccionados')?.value ?? [];
    return seleccionados.includes(idTramite);
  }

  // ============================
  // Archivo
  // ============================
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const control = this.acuerdo.get('documento');
    control?.markAsTouched();

    if (file) {
      this.uploadFile = file;
      this.nombreArchivo = file.name;
      this.archivoUrl = URL.createObjectURL(file);
      control?.setValue(file);
    } else {
      control?.setValue(null);
      this.archivoUrl = null;
    }
  }

  quitarArchivo(): void {
    this.uploadFile = null;
    this.nombreArchivo = '';
    this.acuerdo.patchValue({ documento: null });
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
    if (this.fileInputOficioso?.nativeElement) this.fileInputOficioso.nativeElement.value = '';
    if (this.archivoUrl) {
      URL.revokeObjectURL(this.archivoUrl);
      this.archivoUrl = null;
    }
  }

  verDocumento(): void {
    if (this.archivoUrl) {
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.archivoUrl);
      this.visibleDocumento = true;
    }
  }

  verDocumentoPendiente(documento: DocumentoPendiente): void {
    this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(documento.documento));
    this.visibleDocumento = true;
  }


  // ============================
  // Enviar acuerdo
  // ============================
  onAcuerdoConfirm(event: Event): void {
    this.confirmationService.confirm({
      key: 'acuerdo',
      target: event.target as EventTarget,
      accept: () => this.crearAcuerdo(),
      reject: () => { },
    });
  }

  crearAcuerdo(): void {
    if (this.acuerdo.invalid) {
      this.acuerdo.markAllAsTouched();
      return;
    }

    const values = this.acuerdo.getRawValue();

    if (!(values.documento instanceof File)) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Debes seleccionar un archivo.' });
      return;
    }

    const idsTramitesSeleccionados: number[] = values.autoTramite.tramitesSeleccionados ?? [];

    // Filtrar solo los ids reales (excluir -1 de oficio si viene)
    const idsPromocionesReales = idsTramitesSeleccionados.filter(id => id !== OFICIO_ROW.idTramite);
    const incluyeOficio = idsTramitesSeleccionados.includes(OFICIO_ROW.idTramite);

    const promocionesReales = this.promocionesPendientes.filter(p => idsPromocionesReales.includes(p.idTramite));

    const miniAcuerdos = [
      {
        idDocumento: values.autoInicio.idDocumento,
        tipoAcuerdo: 'inicio',
        clasificacion: values.autoInicio.clasificacion,
        idCatTramite: 3,
        idTramite: values.autoInicio.idTramite,
      },
      {
        tipoAcuerdo: values.tramiteOficioso ? 'tramiteOficioso' : 'tramiteNormal',
        clasificacion: null,
        idCatTramite: values.tramiteOficioso ? null : 2,
        idTramite: null,
        incluyeOficio,
        idsTramites: values.tramiteOficioso ? [] : idsPromocionesReales,
        idsDocumentos: values.tramiteOficioso
          ? []
          : promocionesReales.flatMap(p => p.documentos.map(d => d.idDocumento)),
      },
    ];

    const formData = new FormData();
    formData.append('idExpediente', String(this.expediente?.idExpediente ?? ''));
    formData.append('observaciones', values.observaciones.toUpperCase());
    formData.append('sintesis', values.sintesis.toUpperCase());
    formData.append('miniAcuerdos', JSON.stringify(miniAcuerdos));
    formData.append('documento', values.documento);

    this.isLoading.set(true);
    this.juicioService.postAcuerdo(formData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.status === 200) {
          this.messageService.add({ severity: 'success', summary: 'Acuerdo creado', detail: 'Acuerdo enviado al juez para firma.' });
          this.acuerdo.reset();
          this.quitarArchivo();
          this.detalle(response.data.idAcuerdo);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const apiMsg = error?.error?.message ?? 'No se pudo enviar el acuerdo.';
        const severity = [409, 403].includes(error.status) ? 'info' : 'error';
        const summary = [409, 403].includes(error.status) ? 'Solicitud pendiente' : 'Error';
        this.messageService.add({ severity, summary, detail: apiMsg });
      },
    });
  }

  // ============================
  // Navegación
  // ============================
  detalle(idAcuerdo: number): void {
    this.router.navigate(['/juicioenlinea/acuerdos/detalle'], { state: { idAcuerdo } });
  }

  // ============================
  // Form helpers
  // ============================
  shouldShowError(controlName: string, form: FormGroup = this.acuerdo): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getError(controlName: string, form: FormGroup = this.acuerdo): string {
    const control = form.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('minlength')) return `Mínimo ${control.errors?.['minlength']?.requiredLength} caracteres`;
    if (control?.hasError('maxlength')) return `Máximo ${control.errors?.['maxlength']?.requiredLength} caracteres`;
    return '';
  }

  getDocumentoPrincipal(tramite: TramitePendiente | null): DocumentoPendiente | null {
    return tramite?.documentos?.[0] ?? null;
  }

  getPromocionesSeleccionadas(idsTramites: number[] = []): TramitePendiente[] {
    return this.promocionesPendientes.filter(t => idsTramites.includes(t.idTramite));
  }

  detalleDemanda(idDemanda: number): void {
    this.router.navigate(['/juicioenlinea/demandas/detalle'], { state: { idDemanda } });
  }

  detalleTramite(idTramite: number): void {
    this.router.navigate(['/juicioenlinea/tramites/detalle'], { state: { idTramite } });
  }

  getTipoTramiteTag(idCatTramite: number): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon: string } {
    switch (idCatTramite) {
      case 2: return { severity: 'info', icon: 'pi pi-flag' };
      case 4: return { severity: 'warn', icon: 'pi pi-briefcase' };
      default: return { severity: 'secondary', icon: 'pi pi-file' };
    }
  }
}

