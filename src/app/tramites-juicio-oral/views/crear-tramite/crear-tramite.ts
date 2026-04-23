import { Component, OnInit, signal, AfterViewInit } from '@angular/core';
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
import { CatJuzgadoResponse, TramitesElectronicosRecibidosResponse, ValidarCausaResponse } from '../../interface/tramites-juicio-oral.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { TextareaModule } from 'primeng/textarea';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputMaskModule } from 'primeng/inputmask';
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HttpResponse } from '@angular/common/http';
import { driver } from 'driver.js';

@Component({
  selector: 'app-crear-tramite',
  imports: [
    CommonModule, TableModule, InputTextModule, TagModule, SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, ReactiveFormsModule,
    Spinner, TextareaModule, FileUploadModule, ConfirmDialog, AvatarModule, BreadcrumbModule, InputMaskModule, Breadcrub, ConfirmDialogModule,
    PdfDialog
  ],
  templateUrl: './crear-tramite.html',
  styleUrl: './crear-tramite.css',
  providers: [ConfirmationService]
})
export class CrearTramite implements OnInit, AfterViewInit {
  //* === FORMULARIOS ===
  busquedaForm!: FormGroup;
  documentosForm!: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
  tramitesElectronicosRecibidos: TramitesElectronicosRecibidosResponse | null = null;
  catJuzgados: CatJuzgadoResponse[] = [];
  documentosAnexados: File[] = [];
  causaValidada: ValidarCausaResponse | null = null;

  //* === ESTADOS DE UI Y MODALES ===
  //* === FLAGS Y VARIABLES DE CONTROL ===
  isLoading: boolean = false;
  mostrarAddDocumentos = signal(false);
  mostrarDocumento = false;


  //* === OTROS  ===
  documentoUrl: SafeResourceUrl | null = null;
  nombre = '';

  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  constructor(
    private readonly fb: FormBuilder,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private readonly confirmationService: ConfirmationService,

  ) { }

  loading = false;
  catTipoTramite = [
    { label: 'CAUSA', value: 33 },
    { label: 'CUADERNO DE EJECUCIÓN', value: 47 },
  ];
  ngOnInit(): void {
    // Al inicializar, creamos los formularios:

    this.busquedaForm = this.fb.group({
      idCatTipoTramite: [null, Validators.required],
      numeroExpediente: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
      idJuzgado: [{ value: null, disabled: true }, Validators.required],
      idPantalla: [1]
    });
    this.documentosForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.maxLength(450)]]
    });
  }

  ngAfterViewInit(): void {
    // Retrasamos un poco la ejecución para asegurar que la vista esté completamente renderizada.
    setTimeout(() => {
      this.startTutorial();
    }, 100);
  }

  cargarCatalogoJuzgados(idCatTipoTramite: number | null) {
    const juzgadoCtrl = this.busquedaForm.get('idJuzgado');
    this.catJuzgados = [];
    juzgadoCtrl?.setValue(null, { emitEvent: false });
    juzgadoCtrl?.disable({ emitEvent: false });
    this.mostrarAddDocumentos.set(false);
    this.causaValidada = null;
    this.documentosAnexados = [];

    if (idCatTipoTramite == null) return;

    this.isLoading = true;
    this.apiService.getCatJuzgados({ idCatTipoTramite }).subscribe({
      next: (response) => {
        this.catJuzgados = response.data;
        juzgadoCtrl?.enable({ emitEvent: false });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar juzgados:', error);
        this.isLoading = false;
      }
    });
  }

  onValidarCausa() {
    this.isLoading = true;
    this.mostrarAddDocumentos.set(false);
    const params = this.busquedaForm.getRawValue();
    this.apiService.postValidarCausa(params).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.causaValidada = response.data;
          this.mostrarAddDocumentos.set(true);

          setTimeout(() => {
            this.startTutorialPostValidacion();
          }, 200);
        } else {
          this.confirmationService.confirm({
            key: 'info',
            accept: () => { },
          });
        }
      },
      (error) => {
        this.mostrarAddDocumentos.set(false);
        this.isLoading = false;
      }
    );
  }

  loadCatJuzgados() {
    this.apiService.getCatJuzgados().subscribe(
      (response) => {
        if (response.success) {
          this.catJuzgados = response.data;

        } else {
        }

      },
      (error) => {
      }
    );
  }

  onAnexosSelect(event: FileSelectEvent) {
    this.documentosAnexados = [...this.documentosAnexados, ...event.files];

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
      reject: () => { }
    });

  }
  onEnviarPromocion() {
    this.confirmationService.confirm({
      key: 'promocion',
      accept: () => this.onEnviarTramite(),
      reject: () => { }
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

    this.isLoading = true;
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

    this.apiService.postEnviarTramite(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.tramitesElectronicosRecibidos = response.data;
        this.confirmationService.confirm({
          key: 'success',
          accept: () => this.resetForms(),
          reject: () => this.resetForms()
        });
      },
      error: () => (this.isLoading = false),
    });
  }
  private resetForms(): void {
    this.mostrarAddDocumentos.set(false);
    this.busquedaForm.reset({
      idCatTipoTramite: null,
      numeroExpediente: '',
      idJuzgado: null,
      idPantalla: 1
    });
    this.documentosForm.reset();
    this.documentosAnexados = [];
    this.causaValidada = null;
    this.catJuzgados = [];
  }
  descargarAcuse(): void {
    const id = this.tramitesElectronicosRecibidos?.idTramiteElectronicoRecibido;
    if (!id) return;

    this.apiService.getAcuseTramite(id)
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
          window.URL.revokeObjectURL(url);
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
