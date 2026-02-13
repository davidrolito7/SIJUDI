import { ChangeDetectorRef,Component,ElementRef, OnInit, ViewChild  } from '@angular/core';
import { DetalleRequerimiento, CatTipoDocumento } from '../../../juicio-oral/interfaces/juicioenlinea.model';
import { FieldsetModule } from 'primeng/fieldset';
import { CardModule } from 'primeng/card';
import { JuicioService } from '../../services/juicioenlinea.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormsModule, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CommonModule ,DatePipe } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";

@Component({
  selector: 'app-detalle-requerimientos',
  imports: [PdfDialog,FieldsetModule,CardModule,DatePipe,CommonModule,ConfirmDialogModule,DialogModule,FormsModule,ReactiveFormsModule,ButtonModule],
  templateUrl: './detalle-requerimientos.html',
  styleUrl: './detalle-requerimientos.css',
  providers: [ConfirmationService, MessageService] ,
  standalone: true, 
})
export class DetalleRequerimientos implements OnInit {

  @ViewChild('defaultModal') defaultModal: any;  // Referencia al modal
  @ViewChild('fileInput') fileInput!: ElementRef;

  //Detalles del requerimiento
  idRequerimiento: number | undefined;
  detalleRequerimiento: DetalleRequerimiento | null = null;
  documentoBase64: string | null = null;
  nombre: string | "" = "";//nombre: string | null = null;
  documentoUrl: SafeUrl | null = null;
  loading: boolean = false;
  subido = false;
  listaAnexos: { nombre: any; documento: File; idCatTipoDocumento: any; }[] = [];
  catTipoDocumentos: CatTipoDocumento[] = [];
  requerimientoForm!: FormGroup;
  oficio!: FormGroup;
  visibleAnexo: boolean = false;
  visibleDocumento: boolean = false;
  botonHabilitado: boolean = false; //habilitar el boton 
  mostrarInputNombre: boolean | undefined;
  nombreArchivo: string | undefined;
  archivoSeleccionado: File | null = null;
  mostrarSeccionArchivo: boolean = false;
  archivoUrl: string | null = null;
  mostrarModal: boolean = false;
  permitido: boolean = true;
  nombreUsuario: string | null = null;
  isLoading: boolean = false;


  ngOnInit(): void {

    const state = window.history.state as { idRequerimiento: number };
    console.log('daaa',state)
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
  ) {
    this.requerimientoForm = this.fb.group({
      nombre: [''],
      idCatTipoDocumento: [null, Validators.required],
      documento: [null, Validators.required]
    });

    this.oficio = this.fb.group({
      documentoOficioRequerimiento: [null, Validators.required],
    });
  }

  //  Metodo para listar detalle del requerimiento
  getDetalleRequerimiento(idRequerimiento: number): void {
    this.juicioService.getDetalleRequerimiento(idRequerimiento).subscribe({
      next: (response: any) => {
        // console.log('Datos recibidos:', response.data);
        this.detalleRequerimiento = response.data || null;
        this.getObtenerNombre();
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleRequerimiento = null;
      }
    });
  }


  //Modal
  openModal(idDocumento: number): void {
    this.loading = true; // <-- ¡ACTIVAR cargando!

    this.juicioService.getVerDocumentos(idDocumento).subscribe({
      next: (response: any) => {
        if (response.data && response.data.file) {
          this.loading = false; // <-- ¡ACTIVAR cargando!
          this.documentoBase64 = response.data.file;
          this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/pdf;base64,${this.documentoBase64}`
          );

          if (response.nombre == 'Sin nombre') {
            this.nombre = response.descripcion
          } else {
            this.nombre = response.nombre
          }

          this.defaultModal.nativeElement.classList.remove('hidden');
          this.defaultModal.nativeElement.classList.add('flex');

        } else {
          this.loading = false; // <-- ¡ACTIVAR cargando!
          console.error('No se encontró contenido base64 para el documento');
        }
        this.loading = false; // <-- ¡DESACTIVAR cargando cuando termina!
      },
      error: (error) => {
        console.error('Error al obtener el documento:', error);
        this.loading = false; // <-- también desactiva si falla
      }
    });


  }


  closeModal(): void {
    // Cierra el modal
    this.defaultModal.nativeElement.classList.remove('flex');
    this.defaultModal.nativeElement.classList.add('hidden');
  }


  fechaLimite(callback?: (expiro: boolean) => boolean): boolean {
    const fechaLimite = new Date(this.detalleRequerimiento?.fechaLimite || '');
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
    if (this.catalogo(this.detalleRequerimiento) == 1) {
      valido = true
    }
    return this.fechaValida && valido;
  }

  mostrarUnaVezEnviadoYRevisado(): boolean {
    let valido = false;
    if (this.catalogo(this.detalleRequerimiento) == 3 || this.catalogo(this.detalleRequerimiento) == 4 || this.catalogo(this.detalleRequerimiento) == 5) {
      valido = true
    }
    return valido;
  }

  rechazado(): boolean {
    let valido = false;
    if (this.catalogo(this.detalleRequerimiento) == 5) {
      valido = true
    }
    return valido;
  }

  expiro(): boolean {
    let valido = false;
    if (this.catalogo(this.detalleRequerimiento) == 2) {
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
    const file: File | null = event.target.files[0] || null;
    const control = this.requerimientoForm.get('documento');

    if (control) {
      control.markAsTouched(); // 🔥 fuerza la validación visual
    }

    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = 'Oficio de aclaración del requerimiento';
      control?.setValue(file);
      this.mostrarSeccionArchivo = true;
      this.archivoUrl = URL.createObjectURL(file);
    } else {
      // Si no se selecciona archivo, asegúrate de limpiar el valor
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
    this.botonHabilitado = this.listaAnexos.length > 0;
  }

  verDocumento(anexo: { documento: File, idCatTipoDocumento: number, nombre: string }): void {
    this.loading = true; // Activar cargando

    const reader = new FileReader();
    reader.onload = () => {
      this.documentoBase64 = (reader.result as string).split(',')[1]; // Obtener base64
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:application/pdf;base64,${this.documentoBase64}`
      );

      if (anexo.idCatTipoDocumento === -1) {
        this.nombre = anexo.nombre; // Asignar el nombre directamente si es -1
      } else {
        const tipo = this.catTipoDocumentos.find(
          (tipo: any) => tipo.idCatTipoDocumento === anexo.idCatTipoDocumento
        );
        this.nombre = tipo ? tipo.descripcion : anexo.nombre; // Asignar la descripción del catálogo o el nombre
      }

      this.defaultModal.nativeElement.classList.remove('hidden');
      this.defaultModal.nativeElement.classList.add('flex');
      this.loading = false; // Desactivar cargando
    };

    reader.onerror = () => {
      console.error('Error al leer el archivo');
      this.loading = false; // Desactivar cargando en caso de error
    };

    if (anexo?.documento) {
      reader.readAsDataURL(anexo.documento);
    } else {
      console.error('Documento inválido');
      this.loading = false; // Desactivar cargando si no hay documento
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
    this.botonHabilitado = this.listaAnexos.length > 0;
  }

  confirm() {


    this.confirmationService.confirm({
      header: '¿Estás seguro?',
      message: '¿Desea enviar este requerimiento?',

      accept: () => {
        this.botonHabilitado = false;
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
            this.getDetalleRequerimiento(this.detalleRequerimiento?.idRequerimiento!);
         
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
            this.botonHabilitado = true; // Habilita el botón nuevamente
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

    if (this.detalleRequerimiento?.idRequerimiento !== undefined) {
      this.juicioService.enviarRequerimiento(this.detalleRequerimiento.idRequerimiento, formData).subscribe({
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

  // Método que se ejecuta al cambiar el valor del select
  onTipoDocumentoChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = Number(selectElement.value);

    // Verifica si el valor seleccionado corresponde al último elemento
    const ultimoElemento = this.catTipoDocumentos[this.catTipoDocumentos.length - 1];
    this.mostrarInputNombre = selectedValue === ultimoElemento.idCatTipoDocumento;

    if (this.mostrarInputNombre) {
      // Si es el último elemento, limpia el campo 'nombre' y establece idCatTipoDocumento como null
      this.requerimientoForm.patchValue({ nombre: '' });
    } else {
      // Si no es el último elemento, actualiza el campo 'nombre' con el nombre del catálogo seleccionado
      const tipoSeleccionado = this.catTipoDocumentos.find(
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
        this.catTipoDocumentos = tipoDocumento;
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

    const tipo = this.catTipoDocumentos.find(
      (tipo: any) => tipo.idCatTipoDocumento === +documento.idCatTipoDocumento
    );

    return tipo ? tipo.descripcion : 'Desconocido';
  }


  onFileChange(event: any): void {
    const file: File | null = event.target.files[0] || null;
    const control = this.oficio.get('documentoOficioRequerimiento');

    if (control) {
      control.markAsTouched(); // 🔥 fuerza la validación visual
    }

    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = 'Oficio de aclaración del requerimiento';
      control?.setValue(file);
      this.mostrarSeccionArchivo = true;
      this.archivoUrl = URL.createObjectURL(file);
    } else {
      // Si no se selecciona archivo, asegúrate de limpiar el valor
      control?.setValue(null);
      this.mostrarSeccionArchivo = false;
      this.archivoUrl = '';
    }
  }

  quitarArchivo(fileInput: HTMLInputElement): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.oficio.patchValue({ documentoOficioRequerimiento: null });
    fileInput.value = '';
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
    this.botonHabilitado = this.listaAnexos.length > 0;
  }

  verDocumentoOficio(fileInput: HTMLInputElement): void {
    if (!this.archivoSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin archivo',
        detail: 'No hay archivo de oficio seleccionado para visualizar.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.documentoBase64 = base64;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:application/pdf;base64,${base64}`
      );
      this.nombre = this.nombreArchivo || 'Documento de oficio';
      this.defaultModal.nativeElement.classList.remove('hidden');
      this.defaultModal.nativeElement.classList.add('flex');
      this.loading = false;
    };
    reader.onerror = () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo visualizar el archivo.'
      });
      this.loading = false;
    };

    this.loading = true;
    reader.readAsDataURL(this.archivoSeleccionado);
  }

  getObtenerNombre(): void {
    const usuario = this.detalleRequerimiento?.usuarioSecretario;
    console.log('usuario', usuario);
    this.juicioService.datos(usuario!).subscribe({
      next: (response) => {
        console.log('llego', response.data);
        this.nombreUsuario = response.data;
        console.log('guardando', this.nombreUsuario);
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

}
