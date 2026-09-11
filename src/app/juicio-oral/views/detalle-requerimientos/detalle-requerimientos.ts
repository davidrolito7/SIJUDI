import { ChangeDetectorRef, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { DetalleRequerimiento, CatTipoDocumento, DocumentosRequest } from '../../../juicio-oral/interfaces/juicioenlinea.model';
import { FieldsetModule } from 'primeng/fieldset';
import { CardModule } from 'primeng/card';
import { JuicioService } from '../../services/juicioenlinea.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormsModule, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { TableModule } from 'primeng/table';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { FileUpload, FileUploadClasses, FileUploadModule } from 'primeng/fileupload';
import { base64ToFile } from '../../../shared/functions/utils';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PantallasService } from '../../services/pantallas.service';
import { Spinner } from "../../../shared/components/spinner/spinner";

@Component({
  selector: 'app-detalle-requerimientos',
  imports: [PdfDialog, FieldsetModule, CardModule, DatePipe, CommonModule, ConfirmDialogModule, DialogModule, FormsModule, ReactiveFormsModule, ButtonModule, TableModule, ConfirmDialog, FileUploadModule, SelectModule, InputTextModule, TextareaModule, Spinner],
  templateUrl: './detalle-requerimientos.html',
  styleUrl: './detalle-requerimientos.css',
  providers: [ConfirmationService, MessageService],
  standalone: true,
})
export class DetalleRequerimientos implements OnInit {

  @ViewChild('defaultModal') defaultModal: any;  // Referencia al modal
  @ViewChild('fileInput') fileInput!: ElementRef;

  //Detalles del requerimiento
  idRequerimiento: number | undefined;
  detalleRequerimiento = signal<DetalleRequerimiento | null>(null);
  documentoBase64: string | null = null;
  nombre: string | "" = "";//nombre: string | null = null;
  documentoUrl: SafeUrl | null = null;
  loading: boolean = false;
  subido = false;
  listaAnexos: { nombre: any; documento: File; idCatTipoDocumento: any; }[] = [];
  catTipoDocumentos = signal<CatTipoDocumento[]>([]);
  requerimientoForm!: FormGroup;
  oficio!: FormGroup;
  visibleAnexo: boolean = false;
  visibleDocumento = signal<boolean>(false);
  mostrarInputNombre: boolean | undefined;
  nombreArchivo: string | undefined;
  archivoSeleccionado: File | null = null;
  mostrarSeccionArchivo: boolean = false;
  archivoUrl: string | null = null;
  mostrarModal: boolean = false;
  permitido: boolean = true;
  nombreUsuario: string | null = null;
  isLoading: boolean = false;
  denegarForm!: FormGroup;
  visibleDenegar: boolean = false;
  visibleAdmitir: boolean = false;
  creado = false;

  ngOnInit(): void {

    const state = window.history.state as { idRequerimiento: number };

    if (state && state.idRequerimiento) {

      this.idRequerimiento = state.idRequerimiento;
      this.getDetalleRequerimiento(this.idRequerimiento);
      this.cargarCatTipoDocumento();
    }
  }


  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private sanitizer: DomSanitizer,

    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private readonly fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private pantallasService: PantallasService

  ) {
    this.requerimientoForm = this.fb.group({
      nombre: [''],
      idCatTipoDocumento: [null, Validators.required],
      documento: [null, Validators.required]
    });

    this.oficio = this.fb.group({
      documentoOficioRequerimiento: [null, Validators.required],
    });


    this.denegarForm = this.fb.group({
      rechazo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]]
    });

  }

  //  Metodo para listar detalle del requerimiento
  getDetalleRequerimiento(idRequerimiento: number): void {
    this.juicioService.getDetalleRequerimiento(idRequerimiento).subscribe({
      next: (response: any) => {
        this.detalleRequerimiento.set(response.data || null);

        this.getObtenerNombre();
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleRequerimiento.set(null);
      }
    });
  }
  // En tu TS
  getAcuerdoRow(): any[] {
    const acuerdo = this.detalleRequerimiento()?.documento_acuerdo;
    return acuerdo ? [acuerdo] : [];
  }

  openModal(idDocumento: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.juicioService.getDocumento(idDocumento).subscribe({
      next: (response) => {
        if (response?.data?.file) {
          this.nombre = response.data.nombre ?? 'documento.pdf';
          this.onVerDocumento(response.data.file, this.nombre, 'application/pdf');
        }
      },
      error: (error) => {
        console.error('Error al obtener el documento:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  onVerDocumento(fileBase64: string, nombre: string, mime: string): void {
    const file = base64ToFile(fileBase64, nombre, mime);
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.visibleDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  }

  closeModal(): void {
    // Cierra el modal
    this.defaultModal.nativeElement.classList.remove('flex');
    this.defaultModal.nativeElement.classList.add('hidden');
  }


  fechaLimite(callback?: (expiro: boolean) => boolean): boolean {
    const fechaLimite = new Date(this.detalleRequerimiento()?.fechaLimite || '');
    const fechaActual = new Date();

    if (fechaLimite && fechaLimite >= fechaActual) {
      return callback?.(true) || true; // La fecha límite no ha expirado
    }
    else {
      return callback?.(false) || false; // La fecha límite ha expirado
    }
  }

  get fechaValida(): boolean {
    return this.fechaLimite();
  }

  mostrarSeccionSinDocumento(): boolean {
    let valido = false;
    if (this.catalogo(this.detalleRequerimiento()) == 1) {
      valido = true
    }
    return this.fechaValida && valido;
  }

  mostrarUnaVezEnviadoYRevisado(): boolean {
    let valido = false;
    const estado = this.catalogo(this.detalleRequerimiento());
    if (estado == 3 || estado == 4 || estado == 5) {
      valido = true;
    }
    return valido;
  }
  
  mostrarUnaVezEnviado(): boolean {
    let valido = false;
    if (this.catalogo(this.detalleRequerimiento()) == 3) {
      valido = true
    }
    return valido; // Retorna true si la fecha límite ya pasó y hay un documento nuevo    
  }

  mostrarBoton(): boolean {
    return this.pantallasService.tienePermiso('requerimiento/crear');
  }

  rechazado(): boolean {
    let valido = false;
    if (this.catalogo(this.detalleRequerimiento()) == 5) {
      valido = true
    }
    return valido;
  }

  expiro(): boolean {
    let valido = false;
    if (this.catalogo(this.detalleRequerimiento()) == 2) {
      valido = true
    }
    return valido;
  }


  // Método para recargar datos
  recargarDatos() {
    if (this.idRequerimiento) {
      this.getDetalleRequerimiento(this.idRequerimiento);
    }
  }

  getEstadoRequerimientoConEstilo(requerimiento: any): { nombre: string; clase: string } {
    const historial = requerimiento?.historial;
    if (!historial || historial.length === 0) {
      return { nombre: 'Sin historial', clase: 'bg-gray-200 text-gray-700' };
    }

    const idEstado = historial[historial.length - 1]?.idCatEstadoRequerimientos;

    const catalogo: { [key: number]: { nombre: string; clase: string } } = {
      1: { nombre: 'Pendiente', clase: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      2: { nombre: 'Expirado', clase: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      3: { nombre: 'Entregado', clase: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      4: { nombre: 'Aceptado', clase: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
      5: { nombre: 'Rechazado', clase: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };

    return catalogo[idEstado] || { nombre: 'Estado desconocido', clase: 'bg-gray-200 text-gray-700' };
  }

  catalogo(requerimiento: any): number {
    const historial = requerimiento?.historial;
    if (!historial || historial.length === 0) {
      return 0;
    }
    const idEstado = historial[historial.length - 1]?.idCatEstadoRequerimientos;
    return idEstado;
  }

  //Subir

  showModalAnexo() {
    this.visibleAnexo = true;
  }
  onFileSelected(event: any): void {
    const files: File[] = event?.files ?? event?.currentFiles ?? [];
    const file: File | null = files[0] || null;
    const control = this.requerimientoForm.get('documento');

    if (control) {
      control.markAsTouched();
    }

    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
      control?.setValue(file);
      this.mostrarSeccionArchivo = true;
      this.archivoUrl = URL.createObjectURL(file);
    } else {
      control?.setValue(null);
      this.mostrarSeccionArchivo = false;
      this.archivoUrl = '';
    }
  }
  agregarAnexo() {
    if (this.requerimientoForm.invalid) {
      this.requerimientoForm.markAllAsTouched();
      return;
    }

    const anexo = this.requerimientoForm.value;
    // Verifica si el campo 'idCatTipoDocumento' es null (nombre personalizado)
    if (anexo.idCatTipoDocumento === null) {
      if (!anexo.nombre || anexo.nombre.trim() === '') {
        console.error('Debe ingresar un nombre personalizado para el documento.');
        return;
      }
    }

    this.listaAnexos.push(anexo);
    // this.guardarAnexos();
    this.visibleAnexo = false;
    this.requerimientoForm.reset();
    this.fileInput.nativeElement.value = '';
    this.mostrarInputNombre = false; // Ocultar el campo de texto

  }

  verAcuerdo(anexo: DocumentosRequest): void {
    if (anexo?.documento instanceof File) {
      const url = URL.createObjectURL(anexo.documento);
      this.nombre = anexo.nombre;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.visibleDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  }

  confirm2(event: Event, index: number) {
    this.confirmationService.confirm({
      key: 'anexo',
      target: event.target as EventTarget,
      message: '¿Está seguro de eliminar este documento?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminarAnexo(index)
    });
  }

  eliminarAnexo(index: number) {
    this.listaAnexos.splice(index, 1);
    // Habilita el botón si hay al menos un documento
  }

  confirm() {


    this.confirmationService.confirm({
      key: 'enviarReq',

      accept: () => {
        this.permitido = false;
        this.isLoading = true;
        this.onEnviar((exito, mensajeError) => {

          if (exito) {

            this.messageService.add({
              severity: 'success',
              summary: 'Confirmado',
              detail: '✅ Requerimiento enviado con éxito',
              life: 7000
            });
            this.isLoading = false;
            this.getDetalleRequerimiento(this.detalleRequerimiento()?.idRequerimiento!);

          } else if (this.listaAnexos.length === 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Faltan documentos',
              detail: 'Debe agregar al menos un documento antes de enviar.'
            });
            this.isLoading = false;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: '❌ No se pudo crear el requerimiento: ' + mensajeError
            });
            this.isLoading = false; // Activa el spinner
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Acción cancelada'
        });
      }
    });
  }

  onEnviar(callback?: (exito: boolean, mensaje?: string) => void) {

    const formData = new FormData();
    this.listaAnexos.forEach((anexo) => {
      formData.append('documentoRequerimiento[]', anexo.documento);
      formData.append('idCatTipoDocumento[]', anexo.idCatTipoDocumento);
      formData.append('nombre[]', anexo.nombre || '');
    });

    formData.append('documentoOficioRequerimiento', this.oficio.get('documentoOficioRequerimiento')?.value);

    const detalle = this.detalleRequerimiento();
    if (detalle && detalle.idRequerimiento !== undefined) {
      this.juicioService.enviarRequerimiento(detalle.idRequerimiento, formData).subscribe({
        next: () => {
          this.subido = true;
          callback?.(true);
        },
        error: (error) => {
          console.error('Error al enviar requerimiento:', error);
          callback?.(false, error?.error?.message || 'Error desconocido');
        }
      });
    }
  }

  onTipoDocumentoChange(event: any): void {
    const selectedValue = Number(event.value);
    const ultimoElemento = this.catTipoDocumentos()[this.catTipoDocumentos().length - 1];
    this.mostrarInputNombre = selectedValue === ultimoElemento.idCatTipoDocumento;

    const nombreControl = this.requerimientoForm.get('nombre');
    if (this.mostrarInputNombre) {
      nombreControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(50)]);
      nombreControl?.updateValueAndValidity();
      this.requerimientoForm.patchValue({ nombre: '' });
    } else {
      nombreControl?.clearValidators();
      nombreControl?.updateValueAndValidity();
      const tipoSeleccionado = this.catTipoDocumentos().find(
        (tipo) => tipo.idCatTipoDocumento === selectedValue
      );
      this.requerimientoForm.patchValue({
        nombre: tipoSeleccionado ? tipoSeleccionado.descripcion : '',
        idCatTipoDocumento: selectedValue
      });
    }
  }

  cargarCatTipoDocumento() {
    this.juicioService.getCatTipoDocumento().subscribe({
      next: (tipoDocumento) => {
        this.catTipoDocumentos.set(tipoDocumento);
      },
      error: (error) => {
        console.error('Error al cargar el catálogo de materias:', error);
      }
    });
  }


  getNombreTipoDocumento(documento: any): string {
    if (documento.idCatTipoDocumento === '-1' || documento.idCatTipoDocumento === -1) {
      return documento.nombre; // usar el nombre directamente si es OTRO
    }

    const tipo = this.catTipoDocumentos().find(
      (tipo: any) => tipo.idCatTipoDocumento === +documento.idCatTipoDocumento
    );

    return tipo ? tipo.descripcion : 'Desconocido';
  }


  onOficioSelect(event: any): void {
    const files: File[] = event?.files ?? event?.currentFiles ?? [];
    const file = files?.[0];

    if (!(file instanceof File)) return;

    // marca validación
    const control = this.oficio.get('documentoOficioRequerimiento');
    control?.markAsTouched();

    // guarda 1 solo (sin multiple)
    this.archivoSeleccionado = file;
    this.nombreArchivo = file.name;
    control?.setValue(file);
    control?.updateValueAndValidity();

    this.mostrarSeccionArchivo = true;

    if (this.archivoUrl) URL.revokeObjectURL(this.archivoUrl);
    this.archivoUrl = URL.createObjectURL(file);
  }


  quitarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';

    const control = this.oficio.get('documentoOficioRequerimiento');
    control?.setValue(null);
    control?.markAsTouched();
    control?.updateValueAndValidity();

    this.mostrarSeccionArchivo = false;

    if (this.archivoUrl) {
      URL.revokeObjectURL(this.archivoUrl);
      this.archivoUrl = null;
    }
  }


  tieneDocumentoOficio(): boolean {
    const tieneDocumento = this.oficio.get('documentoOficioRequerimiento')?.value !== null;
    // if (!tieneDocumento) {
    //   this.formatearDocumentos();
    // }
    return tieneDocumento;
  }

  formatearDocumentos() {
    this.listaAnexos = [];
  }

  verDocumentoOficio(): void {
    if (!this.archivoSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin archivo',
        detail: 'No hay archivo de oficio seleccionado para visualizar.'
      });
      return;
    }

    const url = URL.createObjectURL(this.archivoSeleccionado);

    if (this.archivoUrl) URL.revokeObjectURL(this.archivoUrl);
    this.archivoUrl = url;

    this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.nombre = this.nombreArchivo || 'Documento de oficio';
    this.visibleDocumento.set(true);
  }

  getObtenerNombre(): void {
    const usuario = this.detalleRequerimiento()?.usuarioSecretario;

    this.juicioService.datos(usuario!).subscribe({
      next: (response) => {

        this.nombreUsuario = response.data;

      },
      error: (err) => {
        console.error('Error al consumir el API:', err);
      }
    });
  }

  getError(controlName: string, form: FormGroup = this.oficio): string {
    const control = form.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control?.hasError('pattern')) {
      return 'Formato inválido';
    } else if (control?.hasError('minlength')) {
      const min = control.errors?.['minlength']?.requiredLength;
      return `Se requieren al menos ${min} caracteres`;
    } else if (control?.hasError('maxlength')) {
      const max = control.errors?.['maxlength']?.requiredLength;
      return `Se permite un máximo de ${max} caracteres`;
    }

    return 'hola ';
  }
  shouldShowError(controlName: string, form: FormGroup = this.oficio): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorDoc(controlName: string, form: FormGroup = this.requerimientoForm): string {
    const control = form.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control?.hasError('pattern')) {
      return 'Formato inválido';
    } else if (control?.hasError('minlength')) {
      const min = control.errors?.['minlength']?.requiredLength;
      return `Se requieren al menos ${min} caracteres`;
    } else if (control?.hasError('maxlength')) {
      const max = control.errors?.['maxlength']?.requiredLength;
      return `Se permite un máximo de ${max} caracteres`;
    }

    return 'hola ';
  }
  shouldShowErrorDoc(controlName: string, form: FormGroup = this.requerimientoForm): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  cancelarAnexo(): void {
    this.requerimientoForm.reset();
    this.nombreArchivo = '';
    this.archivoSeleccionado = null;
    this.mostrarInputNombre = false;
    this.mostrarSeccionArchivo = false;
    this.visibleAnexo = false;
    if (this.archivoUrl) {
      URL.revokeObjectURL(this.archivoUrl);
      this.archivoUrl = null;
    }
  }
  get botonHabilitado(): boolean {
    return this.listaAnexos.length > 0;
  }


  subirDenegar() {
    this.visibleDenegar = true; // Muestra el diálogo para denegar
    this.visibleAdmitir = false; // Asegura que el diálogo de admitir esté oculto
  }

  admitir() {
    // Asegura que el otro no se active
    //  this.rejectDialog?.hide?.();
    this.visibleAdmitir = false;
    this.confirmationService.confirm({
      key: 'accept',
      header: '¿Estás seguro?',
      message: '¿Desea enviar este requerimiento?',
      accept: () => {
        // this.botonHabilitado = true;
        this.isLoading = true;
        this.aceptarRequerimiento((exito, mensajeError) => {
          if (exito) {
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmado',
              detail: '✅ Requerimiento admitido con éxito'
            });
            this.isLoading = false;
            this.recargarDatos();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: '❌ No se admitir el requerimiento: ' + mensajeError
            });
            this.isLoading = false;
            //  this.botonHabilitado = false;
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Acción cancelada'
        });
      }
    });
  }

  aceptarRequerimiento(callback?: (exito: boolean, mensaje?: string) => void) {
    const detalle = this.detalleRequerimiento();

    if (detalle && detalle.idRequerimiento !== undefined) {
      this.juicioService.admitirRequerimiento(detalle.idRequerimiento).subscribe({
        next: () => {
          this.creado = true;
          callback?.(true);
        },
        error: (error) => {
          console.error('Error al enviar requerimiento:', error);
          callback?.(false, error?.error?.message || 'Error desconocido');
        }
      });
    }
  }

  denegar() {
    this.visibleDenegar = false;
    this.confirmationService.confirm({
      key: 'reject',
      accept: () => {
        this.isLoading = true;
        // this.botonHabilitado = true;
        this.denegarRequerimiento((exito, mensajeError) => {
          if (exito) {
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmado',
              detail: '✅ Requerimiento denegado con éxito'
            });
            this.isLoading = false;
            this.recargarDatos();
            this.visibleDenegar = false;

          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: '❌ No se denegar el requerimiento: ' + mensajeError
            });
            this.isLoading = false;
            //  this.botonHabilitado = false;
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Acción cancelada'
        });
        this.denegarForm.reset();
        // this.denegarForm = new FormGroup({
        //   descripcionRechazo: new FormControl<string>('', Validators.required),
        // });
        // this.denegarForm.get('descripcionRechazo')?.setValue('');
      }

    });
  }
  onCancelarDenegar(): void {
    this.denegarForm.reset();
    this.visibleDenegar = false;
  }

  denegarRequerimiento(callback?: (exito: boolean, mensaje?: string) => void) {
    const formData = new FormData();
    Object.keys(this.denegarForm.controls).forEach((key) => {
      const control = this.denegarForm.get(key);
      if (control && control.value !== null) {
        formData.append(key, control.value as any);
      }
    });
    console.log(formData)
    const detalle = this.detalleRequerimiento();
    if (detalle && detalle.idRequerimiento !== undefined) {
      this.juicioService.denegarRequerimiento(detalle.idRequerimiento, formData).subscribe({
        next: () => {
          this.creado = true;
          callback?.(true);
        },
        error: (error) => {
          console.error('Error al enviar requerimiento:', error);
          callback?.(false, error?.error?.message || 'Error desconocido');
        }
      });
    }
  }

  onCerrarDialogo() {
    this.denegarForm.reset(); // o setValue('')
  }


}



