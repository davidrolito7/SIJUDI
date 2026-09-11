import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JuicioService } from '../../services/juicioenlinea.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { ListarExpedientesResponse } from '../../interfaces/juicioenlinea.model';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";

@Component({
  selector: 'app-crear-requerimiento',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ConfirmDialogModule, ToastModule, ButtonModule,
    SelectModule, InputTextModule, TextareaModule,
    DatePickerModule, FileUploadModule,
    Spinner, PdfDialog,
    ConfirmDialog
],
  templateUrl: './crear-requerimiento.html',
  styleUrl: './crear-requerimiento.css',
  providers: [ConfirmationService, MessageService]
})
export class CrearRequerimiento implements OnInit {

  Abogados: ListarExpedientesResponse[] | undefined;
  NumExpediente!: string;
  idExpediente!: number;
  nombreArchivo: string = '';
  documentoBase64: string | null = null;
  documentoUrl: SafeUrl | null = null;
  archivoSeleccionado: File | null = null;
  mostrarModal = signal<boolean>(false);

  isLoading: boolean = false;
  botonHabilitado: boolean = false;
  hoy: Date = new Date();

  crearRequerimientoForm = new FormGroup({
    descripcion: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(255)
    ]),
    idAbogado: new FormControl<number | null>(null, Validators.required),
    documentoAcuerdo: new FormControl<File | null>(null, Validators.required),
    fechaLimite: new FormControl<Date | null>(null, Validators.required),
  });

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private juicioService: JuicioService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    const state = window.history.state as { idExpediente: number; NumExpediente: string };
    if (state?.idExpediente) {
      this.idExpediente = state.idExpediente;
      this.NumExpediente = state.NumExpediente;
      this.cargarAbogadoExpediente(this.idExpediente);
    }
  }



  // p-fileupload con customUpload emite FileSelectEvent
  onFileChange(event: any): void {
    const file: File = event.files[0];
    const control = this.crearRequerimientoForm.get('documentoAcuerdo');
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
      control?.setValue(file);
      control?.markAsTouched();
    }
  }

  quitarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.crearRequerimientoForm.patchValue({ documentoAcuerdo: null });
    this.documentoUrl = null;
  }

  verDocumentoOficio(): void {
    if (!this.archivoSeleccionado) {
      this.messageService.add({ severity: 'warn', summary: 'Sin archivo', detail: 'No hay archivo seleccionado.' });
      return;
    }
    if (this.archivoSeleccionado.type !== 'application/pdf') {
      this.messageService.add({ severity: 'error', summary: 'Formato inválido', detail: 'Solo se pueden visualizar PDFs.' });
      return;
    }

    // Sin FileReader, sin callbacks async, sin cdr
    const url = URL.createObjectURL(this.archivoSeleccionado);
    this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.mostrarModal.set(true); // síncrono, Angular lo detecta
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.documentoUrl = null;
  }

  confirm(): void {
    if (this.crearRequerimientoForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Complete todos los campos requeridos.' });
      return;
    }

    this.confirmationService.confirm({
      key: 'crearRequerimiento',
      accept: () => {
        this.isLoading = true;
        this.onEnviarRequerimientoNuevo((exito, mensajeError, idRequerimiento) => {
          this.isLoading = false;
          if (exito && idRequerimiento) {
            setTimeout(() => this.detalleRequerimiento(idRequerimiento), 1000);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajeError || 'No se pudo crear el requerimiento.' });
            this.botonHabilitado = false;
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Acción cancelada.' });
      }
    });
  }

  onEnviarRequerimientoNuevo(callback: (exito: boolean, mensaje?: string, idRequerimiento?: number) => void): void {
    if (this.crearRequerimientoForm.invalid) {
      callback(false);
      return;
    }

    const formData = new FormData();
    Object.keys(this.crearRequerimientoForm.controls).forEach(key => {
      let value = this.crearRequerimientoForm.get(key)?.value;

      if (key === 'fechaLimite' && value instanceof Date) {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, '0');
        const dd = String(value.getDate()).padStart(2, '0');
        value = `${yyyy}-${mm}-${dd}`; // formato que Laravel entiende
      }

      if (value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    });
    formData.append('idExpediente', this.idExpediente.toString());

    this.juicioService.crearRequerimientos(formData).subscribe({
      next: (response) => {
        const idRequerimiento = response?.data?.requerimiento?.idRequerimiento;
        callback(true, undefined, idRequerimiento);
      },
      error: (error) => {
        callback(false, error?.error?.message || 'Error desconocido');
      }
    });
  }

  detalleRequerimiento(idRequerimiento: number): void {
    this.router.navigate(['/juicioenlinea/requerimientos/detalle'], {
      state: { idRequerimiento, mensajeExito: 'Requerimiento creado con éxito' }
    });
  }

  cargarAbogadoExpediente(idExpediente: number): void {
    this.juicioService.getListarExpedienteAbogado(idExpediente).subscribe({
      next: (abogados) => { this.Abogados = abogados; },
      error: (error) => { console.error('Error al cargar abogados:', error); }
    });
  }

  shouldShowError(controlName: string, form: FormGroup = this.crearRequerimientoForm): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getError(controlName: string, form: FormGroup = this.crearRequerimientoForm): string {
    const control = form.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('minlength')) return `Se requieren al menos ${control.errors?.['minlength']?.requiredLength} caracteres`;
    if (control?.hasError('maxlength')) return `Máximo ${control.errors?.['maxlength']?.requiredLength} caracteres`;
    if (control?.hasError('pattern')) return 'Formato inválido';
    return '';
  }
}
