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
  ListarExpedientesResponse,
  Partes,
  PartesRequest,
  RegistroExpediente,
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
  buscarUsr!: FormGroup;
  parteForm!: FormGroup;
  remitente!: FormGroup;

  // ============================
  // Expediente / datos
  // ============================
  idExpediente!: number;
  NumExpediente!: string;
  detalleExpediente: RegistroExpediente[] | null = null;
  expediente: ListarExpedientesResponse | null = null;
  detalleDemanda: DetalleDemandaResponse | null = null;

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
  filtroParte: 'busqueda' | 'manual' = 'busqueda';
  usrData: DatosUsuarioResponse | null = null;
  formEnviado = false;

  // ============================
  // Búsqueda de usuario (igual que crear-demanda)
  // ============================
  tipoBusqueda: string | null = null;

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
  isLoading = false;
  visible = false;
  visibleDocumento = signal<boolean>(false);
  visibleM = false;
  tipoSeleccionado = 'promocion';
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
    this.getRemitentes();

    this.tramite = this.fb.group({
      sintesis: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      observaciones: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      documentoTramite: [null, Validators.required],
      partes: this.fb.array([]),
    });

    this.parteForm = this.fb.group({
      idUsr: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoPaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoMaterno: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      correoAlterno: ['', [Validators.email, Validators.maxLength(250)]],
      esMenorEdad: [false], // valor por defecto: false (no menor de edad)
      idCatSexo: [null, Validators.required],
      idCatTipoParte: [null, Validators.required],
    }, { validators: this.correosDiferentesValidator.bind(this) });

    this.remitente = this.fb.group({
      cargo: ['', [Validators.required, Validators.maxLength(100)]],
      categoria: ['', [Validators.required, Validators.maxLength(100)]],
      dependencia: ['', [Validators.required, Validators.maxLength(100)]],
      remitente: ['', [Validators.required, Validators.maxLength(100)]],
    });

    // buscarUsr igual que crear-demanda (tipoBusqueda + curp + usuario)
    this.buscarUsr = this.fb.group({
      tipoBusqueda: [null, Validators.required],
      curp: ['', [Validators.required, Validators.maxLength(18)]],
      usuario: [null, [Validators.required, Validators.maxLength(20)]],
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
        this.detalleExpediente = response.data.registros;
        const exp = response.data.expediente;
        this.expediente = exp;
        this.detalleDemanda = Array.isArray(this.expediente?.demanda)
          ? this.expediente.demanda[0]
          : this.expediente?.demanda;
        this.partes = this.detalleDemanda ? this.detalleDemanda.demanda.partes : [];
        this.cdr.markForCheck();

      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleExpediente = null;
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
    this.isLoading = true;
    this.nombre = this.nombreArchivo || 'Documento';
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64}`);
        this.visibleDocumento.set(true);
      } catch {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar el archivo.' });
      } finally { this.isLoading = false; }
    };
    reader.onerror = () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo leer el archivo.' });
      this.isLoading = false;
    };
    reader.readAsDataURL(this.archivoSeleccionado);
  }

  // ============================
  // Partes — lógica exacta de crear-demanda
  // ============================
  showDialog(): void {
    this.buscarUsr.reset();
    this.editandoParte = false;
    this.visible = true;
    this.formEnviado = false;
    this.actualizarValidadores();
  }

  // igual que crear-demanda
  onTipoBusquedaChange(): void {
    this.tipoBusqueda = this.buscarUsr.get('tipoBusqueda')?.value;
    this.buscarUsr.get('usuario')?.setValue('');
    this.buscarUsr.clearValidators();
  }

  getPlaceholder(): string {
    switch (this.tipoBusqueda) {
      case '2': return '00000/2025';
      case '1': return 'ID General';
      case '3': return 'Código de llave';
      case '4': return 'Número de empleado';
      default: return '';
    }
  }

  aplicarMascaraBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value;
    if (this.tipoBusqueda === '2') {
      valor = valor.replace(/\D/g, '').slice(0, 9);
      if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5, 9);
    } else if (this.tipoBusqueda === '1') {
      valor = valor.replace(/\D/g, '').slice(0, 6);
    } else if (this.tipoBusqueda === '3') {
      valor = valor.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    } else if (this.tipoBusqueda === '4') {
      valor = valor.replace(/[^0-9]/g, '').slice(0, 4);
    }
    this.buscarUsr.get('usuario')?.setValue(valor, { emitEvent: false });
  }

  onBuscarUsuario(): void {
    this.parteForm.reset();
    this.isLoading = true;
    const datosParte = this.buscarUsr.value;
    const request = {
      usuario: datosParte.usuario,
      curp: datosParte.curp,
      tipoBusqueda: datosParte.tipoBusqueda,
    };

    this.juicioService.getDatosUsuario(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.success) {
          this.usrData = response.data;
          const camposReadonly = ['nombre', 'correo', 'correoAlterno', 'direccion'];
          camposReadonly.forEach(c => this.parteForm.get(c)?.enable({ emitEvent: false }));
          this.parteForm.patchValue({
            idUsr: this.usrData?.idUsr,
            nombre: this.usrData?.nombre,
            correo: this.usrData?.correo,
            correoAlterno: this.usrData?.correoAlterno,
            direccion: this.usrData?.direccion,
          });
          camposReadonly.forEach(c => this.parteForm.get(c)?.disable({ emitEvent: false }));
          this.messageService.add({ severity: 'success', summary: 'Datos encontrados', detail: 'Verifique si los datos son correctos.' });
        } else {
          this.messageService.add({ severity: 'info', summary: 'Verifique la información', detail: response.message });
        }
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'warn', summary: 'Ocurrió un error inesperado', detail: 'Intente más tarde.' });
      },
    });
  }
  get todasLasPartes(): any[] {
    return [...this.partes, ...this.listaPartes];
  }
  agregarParte(): void {
    this.formEnviado = true;
    if (this.parteForm.invalid) { this.parteForm.markAllAsTouched(); return; }

    const valores = this.parteForm.getRawValue();
    const nuevaParte: PartesRequest = {
      ...valores,
      idUsr: valores.idUsr?.toString().trim() || null,
      nombre: (valores.nombre ?? '').toUpperCase(),
      apellidoPaterno: (valores.apellidoPaterno ?? '').toUpperCase(),
      apellidoMaterno: (valores.apellidoMaterno ?? '').toUpperCase(),
      direccion: (valores.direccion ?? '').toUpperCase(),
      correo: (valores.correo ?? '').toUpperCase(),
      correoAlterno: (valores.correoAlterno ?? '').toUpperCase(),
      filtroParte: this.filtroParte,
    };

    // Validar duplicado en listaPartes
    if (nuevaParte.idUsr && this.listaPartes.some((p, idx) =>
      p.idUsr === nuevaParte.idUsr && idx !== this.indiceParteEditando)) {
      this.messageService.add({ severity: 'warn', summary: 'Usuario duplicado', detail: 'Este usuario ya fue agregado como parte.' });
      this.parteForm.markAsUntouched();
      this.parteForm.updateValueAndValidity({ emitEvent: false });
      this.formEnviado = false;
      return;
    }

    // Validar duplicado en partes del expediente
    if (nuevaParte.idUsr && this.partes.some(p => String(p.idUsr) === String(nuevaParte.idUsr))) {
      this.messageService.add({ severity: 'warn', summary: 'Usuario ya existe', detail: 'Este usuario ya está registrado en el expediente.' });
      return;
    }

    const tipoSeleccionado = this.catTipoPartes.find(t => t.idCatTipoParte === Number(nuevaParte.idCatTipoParte));
    if (tipoSeleccionado) nuevaParte.descripcionTipoParte = tipoSeleccionado.descripcion;

    if (this.editandoParte) {
      this.listaPartes[this.indiceParteEditando] = { ...nuevaParte };
      this.editandoParte = false;
      this.indiceParteEditando = -1;
    } else {
      this.listaPartes = [...this.listaPartes, { ...nuevaParte }];
    }
    console.info('nueva parte agregada:', this.listaPartes);
    this.sincronizarFormArrayPartes();
    this.visible = false;
    this.parteForm.reset();
    this.formEnviado = false;
    this.tramite.get('partes')?.updateValueAndValidity();
  }

  editarParte(index: number): void {
    this.editandoParte = true;
    this.indiceParteEditando = index;
    const parte = this.listaPartes[index];
    this.filtroParte = parte.filtroParte || ((!parte.apellidoPaterno && !parte.apellidoMaterno) ? 'busqueda' : 'manual');
    this.buscarUsr.reset();
    this.actualizarValidadores();
    this.parteForm.patchValue(parte);
    this.visible = true;
  }

  eliminarParte(index: number): void {
    this.listaPartes = this.listaPartes.filter((_, i) => i !== index);
    this.sincronizarFormArrayPartes();
    this.tramite.get('partes')?.updateValueAndValidity();
  }

  eliminarPartePreregistro(index: number): void {
    this.partes.splice(index, 1);
    this.sincronizarFormArrayPartes();
  }

  resetParteForm(): void {
    this.buscarUsr.reset();
    this.parteForm.reset();
    this.visible = false;
    this.formEnviado = false;
  }

  // igual que crear-demanda
  actualizarValidadores(): void {
    const camposReadonly = ['nombre', 'correo', 'correoAlterno', 'direccion'];
    if (this.filtroParte === 'manual') {
      this.parteForm.get('nombre')?.setValidators([Validators.required, Validators.maxLength(100)]);
      this.parteForm.get('apellidoPaterno')?.setValidators([Validators.required]);
      this.parteForm.get('apellidoMaterno')?.setValidators([Validators.required]);
      camposReadonly.forEach(c => this.parteForm.get(c)?.enable({ emitEvent: false }));
      this.parteForm.reset();

    } else {
      this.parteForm.get('nombre')?.setValidators([Validators.required, Validators.maxLength(90)]);
      this.parteForm.get('apellidoPaterno')?.clearValidators();
      this.parteForm.get('apellidoMaterno')?.clearValidators();
      this.parteForm.get('apellidoPaterno')?.setValue('');
      this.parteForm.get('apellidoMaterno')?.setValue('');
      this.parteForm.reset();
      this.buscarUsr.reset();
      camposReadonly.forEach(c => this.parteForm.get(c)?.disable({ emitEvent: false }));
    }
    this.parteForm.get('nombre')?.updateValueAndValidity();
    this.parteForm.get('apellidoPaterno')?.updateValueAndValidity();
    this.parteForm.get('apellidoMaterno')?.updateValueAndValidity();
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

  private sincronizarFormArrayPartes(): void {
    const partesFormArray = this.tramite.get('partes') as FormArray;
    partesFormArray.clear();
    this.listaPartes.forEach(item => {
      const esBusqueda = !item.apellidoPaterno && !item.apellidoMaterno;
      partesFormArray.push(this.fb.group({
        idUsr: [item.idUsr],
        filtroParte: [item.filtroParte],
        nombre: [item.nombre, [Validators.required, Validators.maxLength(100)]],
        apellidoMaterno: [item.apellidoMaterno, esBusqueda ? [] : [Validators.required, Validators.maxLength(100)]],
        apellidoPaterno: [item.apellidoPaterno, esBusqueda ? [] : [Validators.required, Validators.maxLength(100)]],
        direccion: [item.direccion, [Validators.required, Validators.maxLength(250)]],
        idCatSexo: [item.idCatSexo, Validators.required],
        idCatTipoParte: [item.idCatTipoParte, Validators.required],
      }));
    });
    partesFormArray.updateValueAndValidity();
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
  confirm(): void {
    if (this.tramite.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Por favor complete todos los campos requeridos.' });
      return;
    }
    this.confirmationService.confirm({
      key: 'tramite',
      accept: () => {
        this.isLoading = true;
        this.onCrearTramite((exito, mensajeError, idTramite) => {
          if (exito) {
            this.isLoading = false;
            setTimeout(() => { if (idTramite !== undefined) this.detalleTramite(idTramite); }, 1000);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el trámite: ' + mensajeError });
            this.isLoading = false;
            this.botonHabilitado = false;
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Acción cancelada.' });
      },
    });
  }

  onCrearTramite(callback?: (exito: boolean, mensaje?: string, idTramite?: number) => void): void {
    this.botonHabilitado = true;
    if (this.tramite.invalid) { callback?.(false); return; }

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
                (subKey === 'apellidoPaterno' || subKey === 'apellidoMaterno' || subKey === 'idUsr') &&
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
        this.creado = true;
        callback?.(true, undefined, response?.data?.tramite?.idTramite);
      },
      error: (error) => {
        console.error('Error al crear el trámite:', error);
        callback?.(false, error?.error?.message || 'Ocurrió un error desconocido');
        this.botonHabilitado = false;
      },
    });
  }

  detalleTramite(idTramite: number): void {
    this.router.navigate(['/juicioenlinea/tramites/detalle'], { state: { idTramite, mensajeExito: 'Trámite creado con éxito' } });
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
    if (this.filtroParte === 'manual') {
      const correo = form.get('correo')?.value?.toLowerCase().trim();
      const correoAlterno = form.get('correoAlterno')?.value?.toLowerCase().trim();
      if (correo && correoAlterno && correo === correoAlterno) return { correosIguales: true };
    }
    return null;
  }
}