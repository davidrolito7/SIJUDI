import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ApiService } from '../../service/api.service';
import { ApiResponse, CatJuzgadoResponse, TramitesElectronicosRecibidosResponse, ValidarCausaResponse } from '../../interface/tramites-juicio-oral.model';
import { finalize } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { TextareaModule } from 'primeng/textarea';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HttpResponse } from '@angular/common/http';
import { driver } from 'driver.js';
import { ButtonDirective } from 'primeng/button';
import { TokenService } from '../../../core/auth/service/token.service';

@Component({
  selector: 'app-crear-tramite',
  imports: [
    CommonModule, TableModule, InputTextModule, TagModule, SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, ReactiveFormsModule,
    Spinner, TextareaModule, ConfirmDialog, AvatarModule, BreadcrumbModule, InputMaskModule, ConfirmDialogModule,
    ButtonDirective, PdfDialog
  ],
  templateUrl: './crear-tramite.html',
  styleUrl: './crear-tramite.css',
  providers: [ConfirmationService]
})
export class CrearTramite implements OnInit {
  readonly maxFileSizeBytes = 10 * 1024 * 1024;
  readonly maxAnexos = 10;
  @ViewChild('anexosInput') anexosInput?: ElementRef<HTMLInputElement>;

  //* === FORMULARIOS ===
  busquedaForm: FormGroup;
  documentosForm: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
  tramitesElectronicosRecibidos: TramitesElectronicosRecibidosResponse | null = null;
  catJuzgados: CatJuzgadoResponse[] = [];
  documentosAnexados: File[] = [];
  causaValidada: ValidarCausaResponse | null = null;

  //* === ESTADOS DE UI Y MODALES ===
  //* === FLAGS Y VARIABLES DE CONTROL ===
  readonly isLoading = signal(false);
  mostrarAddDocumentos = signal(false);
  mostrarDocumento = false;
  isAnexosDragOver = false;
  isDescargandoAcuse = signal(false);
  tipoNumeroExpediente = signal<string | null>(null);

  //* === OTROS  ===
  documentoUrl: SafeResourceUrl | null = null;
  nombre = '';

  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  private readonly apiService = inject(ApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly tokenService = inject(TokenService);


  loading = false;
  catTipoTramite = [
    { label: 'CAUSA', value: 33 },
    { label: 'CUADERNO ANTECEDENTE', value: 34 },
    // { label: 'CUADERNO DE EJECUCIÓN', value: 47 },
  ];

  constructor() {
    this.busquedaForm = this.fb.group({
      idCatTipoTramite: [null, Validators.required],
      numeroExpediente: ['', Validators.required],
      idJuzgado: [{ value: null, disabled: true }, Validators.required],
      // idPantalla: [1]
    });
    this.documentosForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.maxLength(450)]]
    });

    this.updateNumeroExpedienteValidator(this.busquedaForm.get('idCatTipoTramite')?.value);
    this.busquedaForm.get('idCatTipoTramite')?.valueChanges.subscribe((idCatTipoTramite) => {
      this.updateNumeroExpedienteValidator(idCatTipoTramite);
    });
  }

  ngOnInit(): void {
    if (!this.eresAbogado()) {
      this.cargarTodosLosJuzgados();
    }
  }

  // ngAfterViewInit(): void {
  //   // Retrasamos un poco la ejecución para asegurar que la vista esté completamente renderizada.
  //   setTimeout(() => {
  //     this.startTutorial();
  //   }, 100);
  // }

  onTipoTramiteChange(idTipoTramite: number | null): void {
    if(idTipoTramite === 33 || idTipoTramite === 34) {
      this.tipoNumeroExpediente.set(idTipoTramite === 33 ? 'causa' : 'cuaderno');
    }else {
      this.tipoNumeroExpediente.set(null);
    }
    if(idTipoTramite !== null) {
      this.cargarCatalogoJuzgados(idTipoTramite);
    }
  }

  cargarCatalogoJuzgados(idCatTipoTramite: number | null): void {
    const juzgadoCtrl = this.busquedaForm.get('idJuzgado');

    this.busquedaForm.get('numeroExpediente')?.reset('', { emitEvent: false });
    this.mostrarAddDocumentos.set(false);
    this.causaValidada = null;
    this.documentosAnexados = [];

    if (!this.eresAbogado()) {
      return;
    }

    this.catJuzgados = [];
    juzgadoCtrl?.setValue(null, { emitEvent: false });
    juzgadoCtrl?.disable({ emitEvent: false });

    if (idCatTipoTramite === null) {
      return;
    }

    this.isLoading.set(true);
    this.apiService.getCatJuzgados(idCatTipoTramite).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        this.catJuzgados = response.data;
        juzgadoCtrl?.enable({ emitEvent: false });
      },
      error: (error: unknown) => {
        console.error('Error al cargar juzgados:', error);
      }
    });
  }

  eresAbogado(): boolean {
    return this.tokenService.getUserFromToken()?.idSistemaPerfil === 10;
  }

  private cargarTodosLosJuzgados(): void {
    const juzgadoCtrl = this.busquedaForm.get('idJuzgado');

    this.isLoading.set(true);
    this.apiService.getAllCatJuzgados().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        this.catJuzgados = response.data;
        juzgadoCtrl?.setValue(null, { emitEvent: false });
        juzgadoCtrl?.enable({ emitEvent: false });
      },
      error: (error: unknown) => {
        console.error('Error al cargar todos los juzgados:', error);
      }
    });
  }

  get numeroExpedienteMask(): string {
    return this.busquedaForm.get('idCatTipoTramite')?.value === 34 ? '999999/9999' : '9999/9999';
  }

  get numeroExpedientePlaceholder(): string {
    return this.busquedaForm.get('idCatTipoTramite')?.value === 34 ? '000000/0000' : '0000/0000';
  }

  get numeroTramiteLabel(): string {
    return this.causaValidada?.idCatTipoTramite === 34 ? 'Número de cuaderno' : 'Número de causa';
  }

  get numeroTramiteValor(): string {
    const causaValidada = this.causaValidada;
    if (!causaValidada) {
      return '—';
    }

    const valor = causaValidada.idCatTipoTramite === 34 ? causaValidada.numCuaderno : causaValidada.numCausa;
    return valor || '—';
  }

  private updateNumeroExpedienteValidator(idCatTipoTramite: number | null): void {
    const numeroExpedienteCtrl = this.busquedaForm.get('numeroExpediente');
    const pattern = idCatTipoTramite === 34 ? /^\d{6}\/\d{4}$/ : /^\d{4}\/\d{4}$/;

    numeroExpedienteCtrl?.setValidators([Validators.required, Validators.pattern(pattern)]);
    numeroExpedienteCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onValidarCausa() {
    this.isLoading.set(true);
    this.mostrarAddDocumentos.set(false);
    const params = this.busquedaForm.getRawValue();
    this.apiService.postValidarCausa(params).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: { success: boolean; data: ValidarCausaResponse }) => {
        if (response.success) {
          this.causaValidada = response.data;
          this.confirmationService.confirm({
            key: 'confirmarCausa',
            message: 'true',
            accept: () => this.mostrarAddDocumentos.set(true),
            reject: () => { /* empty */ },
          });

        } else {
          this.confirmationService.confirm({
            key: 'info',
            accept: () => { /* empty */ },
          });
        }
      },
      error: (error: unknown) => console.error('Error al validar causa:', error),
    });
  }
  onAnexosInputChange(event: Event) {
    const input = event.target as HTMLInputElement | null;
    this.processSelectedFiles(input?.files);
  }

  onAnexosDragOver(event: DragEvent) {
    event.preventDefault();
    this.isAnexosDragOver = true;
  }

  onAnexosDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isAnexosDragOver = false;
  }

  onAnexosDrop(event: DragEvent) {
    event.preventDefault();
    this.isAnexosDragOver = false;
    this.processSelectedFiles(event.dataTransfer?.files);
  }

  private processSelectedFiles(files: unknown) {
    const archivosSeleccionados = this.normalizeSelectedFiles(files);
    const archivosValidos = archivosSeleccionados.filter((file) => file.size <= this.maxFileSizeBytes);
    const espaciosDisponibles = this.maxAnexos - this.documentosAnexados.length;

    if (archivosValidos.length !== archivosSeleccionados.length) {
      this.confirmationService.confirm({
        key: 'archivo-peso',
        accept: () => { /* empty */ },
      });
    }

    if (espaciosDisponibles <= 0) {
      this.confirmationService.confirm({
        key: 'archivo-limite',
        accept: () => { /* empty */ },
      });
      return;
    }

    if (archivosValidos.length > espaciosDisponibles) {
      this.confirmationService.confirm({
        key: 'archivo-limite',
        accept: () => { /* empty */ },
      });
    }

    this.documentosAnexados = [
      ...this.documentosAnexados,
      ...archivosValidos.slice(0, espaciosDisponibles)
    ];

    this.resetAnexosInput();
  }

  private normalizeSelectedFiles(files: unknown): File[] {
    if (Array.isArray(files)) {
      return files.filter((file): file is File => file instanceof File);
    }

    if (this.isFileList(files)) {
      return Array.from(files);
    }

    return files instanceof File ? [files] : [];
  }

  private isFileList(files: unknown): files is FileList {
    return typeof FileList !== 'undefined' && files instanceof FileList;
  }

  private resetAnexosInput() {
    if (this.anexosInput?.nativeElement) {
      this.anexosInput.nativeElement.value = '';
    }
  }

  onVerDocumento(file: File): void {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.nombre = file.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento = true;
    } else {
      console.error('Documento inválido');
    }
  }

  eliminarAnexo(index: number) {
    this.confirmationService.confirm({
      key: 'anexo',
      accept: () => this.onEliminarDocumento(index),
      reject: () => { /* empty */ }
    });

  }
  onEnviarPromocion() {
    this.confirmationService.confirm({
      key: 'promocion',
      accept: () => this.onEnviarTramite(),
      reject: () => { /* empty */ }
    });

  }

  onEliminarDocumento(index: number): void {
    this.documentosAnexados.splice(index, 1);
  }

  onEnviarTramite(): void {
    if (this.busquedaForm.invalid || this.documentosForm.invalid) {
      this.busquedaForm.markAllAsTouched();
      this.documentosForm.markAllAsTouched(); // 👈 valida ambos
      return;
    }

    this.isLoading.set(true);
    const formData = new FormData();
    const busquedaValue = this.busquedaForm.getRawValue();
    const documentosValue = this.documentosForm.getRawValue(); // 👈 observaciones desde aquí

    // idExpediente: si es causa usa idCausa, si es cuaderno usa idCuaderno
    const idExpediente = this.causaValidada?.idCausa ?? this.causaValidada?.idCuaderno ?? 0;

    formData.append('idExpediente', idExpediente.toString());
    formData.append('idCatTipoTramite', busquedaValue.idCatTipoTramite?.toString() ?? '0');
    formData.append('IdCatJuzgado', this.causaValidada?.idCatJuzgado?.toString() ?? '0');
    formData.append('Observaciones', documentosValue.observaciones ?? '');

    this.documentosAnexados.forEach((file) => {
      formData.append('Archivos', file, file.name);
    });

    this.apiService.postEnviarTramite(formData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
      next: (response: ApiResponse<TramitesElectronicosRecibidosResponse>) => {
        if (!response.success) {
          return;
        }

        this.tramitesElectronicosRecibidos = response.data;
        this.confirmationService.confirm({
          key: 'success',
          reject: () => this.resetForms()
        });
      },
      error: (error: unknown) => console.error('Error al enviar el trámite:', error),
    });
  }
  private resetForms(): void {
    this.mostrarAddDocumentos.set(false);
    this.busquedaForm.reset({
      idCatTipoTramite: null,
      numeroExpediente: '',
      idJuzgado: null,
      //idPantalla: 1
    });
    this.documentosForm.reset();
    this.documentosAnexados = [];
    this.resetAnexosInput();
    this.causaValidada = null;
  }
  descargarAcuse(): void {
    const id = this.tramitesElectronicosRecibidos?.idTramiteElectronicoRecibido;
    if (!id || this.isDescargandoAcuse()) {
      return;
    }

    this.isDescargandoAcuse.set(true);
    this.apiService.getAcuseTramite(id)
      .pipe(finalize(() => this.isDescargandoAcuse.set(false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const disposition = response.headers.get('content-disposition') ?? '';
          const match = disposition.match(/filename="([^"]+)"/);
          const filename = match ? match[1] : `Acuse_${id}.pdf`;

          const url = window.URL.createObjectURL(response.body!);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        },
        error: () => console.error('Error al descargar el acuse')
      });
  }

  startTutorialPostValidacion() {
    const driverObj = driver({
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Finalizar',
      showProgress: true,
      showButtons: ['next', 'previous'],
      steps: [
        { element: '#fileUpload', popover: { title: 'Adjuntar Archivos', description: 'Haz clic aquí para cargar los documentos requeridos en formato PDF.', side: "bottom", align: 'start' } },
        { element: '#observaciones', popover: { title: 'Observaciones', description: 'Escribe aquí cualquier observación o comentario sobre el trámite.', side: "top", align: 'start' } },
      ]
    });

    driverObj.drive();
  }

  startTutorial() {
    const driverObj = driver({
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Finalizar',
      showProgress: true,
      showButtons: ['next', 'previous'],
      steps: [
        { element: '#tipoTramite', popover: { title: 'Selecciona un tipo de trámite', description: 'Haz clic aquí y elige el tipo de trámite que deseas crear.', side: "left", align: 'start' } },
        { element: '#numeroExpediente', popover: { title: 'Ingresa el número de expediente', description: 'Escribe el número de expediente correspondiente.', side: "left", align: 'start' } },
        { element: '#juzgado', popover: { title: 'Selecciona un juzgado', description: 'Elige el juzgado donde se presentará el trámite.', side: "bottom", align: 'start' } },
        { element: '#botonBuscar', popover: { title: 'Buscar', description: 'Presiona este botón para validar la causa.', side: "left", align: 'start' } },
      ]
    });

    driverObj.drive();
  }
}


