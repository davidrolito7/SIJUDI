import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, signal, Signal, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';

// ============================
// PrimeNG
// ============================
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

// ============================
// App - shared
// ============================
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

// ============================
// App - feature
// ============================
import { JuicioService } from '../../services/juicioenlinea.service';
import {
  CatSexos,
  CatTipoPartes,
  DatosUsuarioResponse,
  DetalleDemandaResponse,
  DetalleExpedienteResponse,
  ListarExpedientesResponse,
  Partes,
  PartesRequest,
  Remitente,
} from '../../interfaces/juicioenlinea.model';
import { PantallasService } from '../../services/pantallas.service';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";

@Component({
  selector: 'app-crear-tramite',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    IconFieldModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputIconModule,
    InputTextModule,
    RadioButtonModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    ToastModule,
    TooltipModule,
    ToggleSwitchModule,
    // Shared
    Breadcrub,
    Spinner,
    ConfirmDialog,
    PdfDialog
  ],
  templateUrl: './crear-tramite.html',
  styleUrl: './crear-tramite.css',
  providers: [ConfirmationService, MessageService],
})
export class CrearTramite implements OnInit {

  // ============================
  // UI options
  // ============================
  tipoOptions = [
    { label: 'Selecciona una opción', value: '' },
    { label: 'Promoción', value: 'promocion' },
    { label: 'Oficio', value: 'oficio' },
  ];

  // ============================
  // Formularios
  // ============================
  tramite!: FormGroup;
  parteForm!: FormGroup;
  remitente!: FormGroup;

  // ============================
  // Expediente / datos
  // ============================
  idExpediente!: number;
  NumExpediente!: string;
  detalleExpediente = signal<DetalleExpedienteResponse | null>(null);
  expediente: ListarExpedientesResponse | null = null;

  // ============================
  // Catálogos
  // ============================
  catTipoPartes: CatTipoPartes[] = [];
  catSexos: CatSexos[] = [];

  // ============================
  // Partes
  // ============================
  partes: Partes[] = [];              // Partes ya existentes en el expediente
  listaPartes: PartesRequest[] = [];  // Partes nuevas a agregar
  editandoParte = false;
  indiceParteEditando = -1;
  formEnviado = false;

  // ============================
  // Remitente
  // ============================
  remitentes: Remitente[] = [];
  remitenteSeleccionado?: Remitente;
  busqueda = '';

  // ============================
  // Archivo / documento
  // ============================
  nombreArchivo: string | undefined;
  archivoSeleccionado: File | null = null;
  archivoUrl: string | null = null;
  documentoUrl: SafeUrl | null = null;
  nombre = '';

  // ============================
  // UI flags
  // ============================
  isLoading = signal(false);
  tramiteResponse: any = null;
  visible = false;
  visibleDocumento = signal<boolean>(false);
  visibleM = false;
  get tipoSeleccionado(): string {
    return this.tramite?.get('tipoTramite')?.value ?? 'promocion';
  }
  mostrarAlerta = false;
  botonHabilitado = false;
  creado = false;
  catTramite!: number;

  @ViewChild('fileInput') fileInput!: ElementRef;

  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private readonly fb: FormBuilder,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly sanitizer: DomSanitizer,
    private juicioService: JuicioService,
    private router: Router,
    private au: PantallasService,
    private cdr: ChangeDetectorRef,
  ) { }

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    this.mostrarAlerta = true;
    this.cargarCatalogoSexos();
    this.cargarCatalogoTipoPartes();
    //this.getRemitentes();

    this.tramite = this.fb.group({
      tipoTramite: ['promocion', [Validators.required]],
      sintesis: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      observaciones: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      documentoTramite: [null, Validators.required],
      partes: this.fb.array([]),
    });

    this.parteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoPaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoMaterno: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      correoAlterno: ['', [Validators.email, Validators.maxLength(250)]],
      esMenorEdad: [false],
      idCatSexo: [null, Validators.required],
      idCatTipoParte: [null, Validators.required],
      curp: ['', [Validators.required, Validators.maxLength(18), Validators.pattern(/^[A-Z0-9]{18}$/)]],
    }, { validators: this.correosDiferentesValidator.bind(this) });


    this.remitente = this.fb.group({
      cargo: ['', [Validators.required, Validators.maxLength(100)]],
      categoria: ['', [Validators.required, Validators.maxLength(100)]],
      dependencia: ['', [Validators.required, Validators.maxLength(100)]],
      remitente: ['', [Validators.required, Validators.maxLength(100)]],
    });



    const state = window.history.state as { idExpediente: number; NumExpediente: string };
    if (state?.idExpediente) {
      this.idExpediente = state.idExpediente;
      this.NumExpediente = state.NumExpediente;
      this.getDetalleExpediente(this.idExpediente);
    }
  }

  // ============================
  // Data
  // ============================
  getDetalleExpediente(idExpediente: number): void {
    this.juicioService.getDetalleExpediente(idExpediente).subscribe({
      next: (response) => {
        this.detalleExpediente.set(response.data);
        const exp = response.data;
        this.expediente = exp as any;
        
        if (this.expediente?.demanda?.partes) {
          this.partes = this.expediente.demanda.partes;
        } else {
          this.partes = [];
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleExpediente.set(null);
        this.partes = [];
      },
    });
  }

  // ============================
  // Archivo
  // ============================
  onFileChange(event: any): void {
    const file: File | null = event.target.files[0] || null;
    const control = this.tramite.get('documentoTramite');
    control?.markAsTouched();
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = 'Acuerdo del trámite';
      control?.setValue(file);
      this.archivoUrl = URL.createObjectURL(file);
    } else {
      control?.setValue(null);
      this.archivoUrl = '';
    }
  }

  quitarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.tramite.patchValue({ documentoTramite: null });
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
    if (this.archivoUrl) { URL.revokeObjectURL(this.archivoUrl); this.archivoUrl = null; }
  }

  verDocumentoTramite(): void {
    if (!this.archivoSeleccionado) {
      this.messageService.add({ severity: 'warn', summary: 'Sin archivo', detail: 'No hay archivo seleccionado para visualizar.' });
      return;
    }
    if (this.archivoSeleccionado.type !== 'application/pdf') {
      this.messageService.add({ severity: 'error', summary: 'Formato inválido', detail: 'Solo se pueden visualizar archivos PDF.' });
      return;
    }
    this.isLoading.set(true);
    this.nombre = this.nombreArchivo || 'Documento';
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64}`);
        this.visibleDocumento.set(true);
      } catch {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar el archivo.' });
      } finally { this.isLoading.set(false); }
    };
    reader.onerror = () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo leer el archivo.' });
      this.isLoading.set(false);
    };
    reader.readAsDataURL(this.archivoSeleccionado);
  }

  // ============================
  // Partes — lógica exacta de crear-demanda
  // ============================
  showDialog(): void {
    this.editandoParte = false;
    this.indiceParteEditando = -1;
    this.parteForm.reset({
      esMenorEdad: false
    });
    this.formEnviado = false;
    this.visible = true;
  }
  get todasLasPartes(): any[] {
    return [...this.partes, ...this.listaPartes];
  }
  agregarParte() {
    this.formEnviado = true;

    if (this.parteForm.invalid) {
      this.parteForm.markAllAsTouched();
      return;
    }

    const valores = this.parteForm.getRawValue();

    const nuevaParte: PartesRequest = {
      ...valores,
      //// idUsr: valores.idUsr?.toString().trim() || null,
      nombre: (valores.nombre ?? '').toUpperCase(),
      apellidoPaterno: (valores.apellidoPaterno ?? '').toUpperCase(),
      apellidoMaterno: (valores.apellidoMaterno ?? '').toUpperCase(),
      direccion: (valores.direccion ?? '').toUpperCase(),
      correo: (valores.correo ?? '').toUpperCase(),
      correoAlterno: (valores.correoAlterno ?? '').toUpperCase(),
    };

    // Normaliza el nombre completo quitando espacios extra para comparar
    const normalizar = (s: string) => (s ?? '').replace(/\s+/g, ' ').trim().toUpperCase();
    const nombreCompleto = normalizar(
      `${nuevaParte.nombre} ${nuevaParte.apellidoPaterno} ${nuevaParte.apellidoMaterno}`
    );

    const duplicado = this.listaPartes.some((p: PartesRequest, idx: number) => {
      if (idx === this.indiceParteEditando) return false;
      const nombreExistente = normalizar(
        `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`
      );
      return nombreExistente === nombreCompleto;
    });

    if (duplicado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Parte duplicada',
        detail: 'Ya existe una parte con el mismo nombre completo.'
      });
      this.formEnviado = false;
      this.parteForm.markAsUntouched();
      return;
    }

    // Validar duplicado por correo
    if (
      nuevaParte.correo &&
      this.listaPartes.some((p: PartesRequest, idx: number) =>
        p.correo === nuevaParte.correo && idx !== this.indiceParteEditando
      )
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Correo duplicado',
        detail: 'Ya existe una parte con este correo electrónico.'
      });
      this.formEnviado = false;
      this.parteForm.markAsUntouched();
      return;
    }

    const tipoParteSeleccionada = this.catTipoPartes.find(
      (tipo) => tipo.idCatTipoParte === Number(nuevaParte.idCatTipoParte)
    );
    if (tipoParteSeleccionada) {
      nuevaParte.descripcionTipoParte = tipoParteSeleccionada.descripcion;
    }

    if (this.editandoParte) {
      this.listaPartes[this.indiceParteEditando] = { ...nuevaParte };
      this.editandoParte = false;
      this.indiceParteEditando = -1;
    } else {
      this.listaPartes.push({ ...nuevaParte });
    }

    this.visible = false;
    this.parteForm.reset({ esMenorEdad: false });
    this.formEnviado = false;
  }

  editarParte(index: number) {
    this.editandoParte = true;
    this.indiceParteEditando = index;

    const parte = this.listaPartes[index];
    this.parteForm.reset({ esMenorEdad: false });
    this.parteForm.patchValue(parte);
    this.formEnviado = false;
    this.visible = true;
  }

  eliminarParte(index: number) {
    this.listaPartes.splice(index, 1);
  }

  eliminarPartePreregistro(index: number): void {
    this.partes.splice(index, 1);
  }

  resetParteForm(): void {
    this.parteForm.reset({ esMenorEdad: false });
    this.editandoParte = false;
    this.indiceParteEditando = -1;
    this.formEnviado = false;
    this.visible = false;
  }



  confirm1(event: Event, index: number): void {
    this.confirmationService.confirm({
      key: 'parte',
      target: event.target as EventTarget,
      accept: () => this.eliminarParte(index),
      reject: () => { },
    });
  }

  confirmPartes(event: Event, index: number): void {
    this.confirmationService.confirm({
      key: 'parte',
      target: event.target as EventTarget,
      accept: () => this.eliminarPartePreregistro(index),
      reject: () => { },
    });
  }



  // ============================
  // Remitente
  // ============================
  abrirModal(): void { this.visibleM = true; }

  getRemitentes(): void {
    this.juicioService.getRemitentes(this.busqueda).subscribe({
      next: (res) => {
        this.remitentes = res.data;
        this.cdr.markForCheck();

      },
      error: (err) => console.error('Error al cargar remitentes:', err),
    });
  }

  seleccionar(remitente: Remitente): void {
    this.remitenteSeleccionado = remitente;
    this.visibleM = false;
  }

  // ============================
  // Confirmación / envío
  // ============================
  confirm(event: Event): void {
    if (this.tramite.invalid) {
      this.tramite.markAllAsTouched();
      return;
    }
    this.confirmationService.confirm({
      key: 'tramite',
      target: event.target as EventTarget,
      accept: () => {
        this.onCrearTramite();
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Acción cancelada.' });
      },
    });
  }

  onCrearTramite(): void {
    this.botonHabilitado = true;
    if (this.tramite.invalid) return;

    this.isLoading.set(true);

    if (this.mostrarBoton()) {
      if (this.tipoSeleccionado === 'promocion') {
        this.catTramite = 2;
        this.remitenteSeleccionado = undefined;
      } else {
        this.catTramite = 1;
        this.listaPartes = [];
        this.tramite.get('partes')?.setValue([]);
      }
    } else {
      this.catTramite = 2;
      this.remitenteSeleccionado = undefined;
    }

    const data = {
      ...this.tramite.value,
      partes: this.catTramite === 2 ? [...this.partes, ...this.listaPartes] : [],
    };

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        if (key === 'partes' && this.catTramite === 2) {
          data[key].forEach((parte: any, index: number) => {
            const { descripcionTipoParte, ...parteSinDescripcion } = parte;
            Object.keys(parteSinDescripcion).forEach(subKey => {
              if (
                (subKey === 'apellidoPaterno' || subKey === 'apellidoMaterno') &&
                (!parteSinDescripcion[subKey] || parteSinDescripcion[subKey].toString().trim() === '')
              ) return;
              formData.append(`partes[${index}][${subKey}]`, parteSinDescripcion[subKey]);
            });
          });
        }
      } else {
        formData.append(key, data[key]);
      }
    });

    formData.append('idExpediente', this.idExpediente.toString());
    formData.append('idCatTramite', this.catTramite.toString());
    if (this.catTramite === 1) {
      formData.append('idCatRemitente', this.remitenteSeleccionado?.idCatRemitente?.toString() || '');
    }

    this.juicioService.crearTramite(formData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.creado = true;
        this.tramiteResponse = response?.data;
        const idTramite = response?.data?.idTramite;
        this.confirmationService.confirm({
          key: 'success',
          accept: () => {
            if (idTramite !== undefined) this.detalleTramite(idTramite);
          },
          reject: () => {
            this.limpiarFormulario();
          }
        });
      },
      error: (error) => {
        console.error('Error al crear el trámite:', error);
        const mensajeError = error?.error?.message || 'Ocurrió un error desconocido';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el trámite: ' + mensajeError });
        this.isLoading.set(false);
        this.botonHabilitado = false;
      },
    });
  }

  detalleTramite(idTramite: number): void {
    this.router.navigate(['/juicioenlinea/tramites/detalle'], { state: { idTramite, mensajeExito: 'Trámite creado con éxito' } });
  }

  limpiarFormulario(): void {
    this.tramite.reset({ tipoTramite: 'promocion' });
    this.parteForm.reset({ esMenorEdad: false });
    this.listaPartes = [];
    this.remitenteSeleccionado = undefined;
    this.remitente.reset();
    this.quitarArchivo();
    this.formEnviado = false;
    this.tramiteResponse = null;
  }

  // ============================
  // Helpers
  // ============================
  mostrarBoton(): boolean {
    return this.au.tienePermiso('requerimiento/crear');
  }

  validarPartes(): boolean {
    if (this.listaPartes.length === 0 && this.partes.length === 0) return false;
    this.mostrarAlerta = false;
    return true;
  }

  remitenteValido(): boolean { return this.mostrarBoton() && !!this.remitenteSeleccionado; }

  getError(controlName: string, form: FormGroup = this.tramite): string {
    const control = form.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('pattern')) return 'Formato inválido';
    if (control?.hasError('minlength')) return `Se requieren al menos ${control.errors?.['minlength']?.requiredLength} caracteres`;
    if (control?.hasError('maxlength')) return `Se permite un máximo de ${control.errors?.['maxlength']?.requiredLength} caracteres`;
    return '';
  }

  shouldShowError(controlName: string, form: FormGroup = this.tramite): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.formEnviado) : false;
  }

  // ============================
  // Catálogos
  // ============================
  cargarCatalogoSexos(): void {
    this.juicioService.getCatalogoSexos().subscribe({
      next: (response) => {
        this.catSexos = response.data ?? response;
        this.cdr.markForCheck();

      },
      error: (error) => console.error('Error al cargar sexos:', error),
    });
  }

  cargarCatalogoTipoPartes(): void {
    this.juicioService.getCatalogoTipoPartes().subscribe({
      next: (response) => {
        this.catTipoPartes = response;
        this.cdr.markForCheck();

      },
      error: (error) => console.error('Error al cargar tipo partes:', error),
    });
  }

  correosDiferentesValidator(form: FormGroup) {
    const correo = form.get('correo')?.value?.toLowerCase().trim();
    const correoAlterno = form.get('correoAlterno')?.value?.toLowerCase().trim();
    if (correo && correoAlterno && correo === correoAlterno) {
      return { correosIguales: true };
    }
    return null;
  }
}