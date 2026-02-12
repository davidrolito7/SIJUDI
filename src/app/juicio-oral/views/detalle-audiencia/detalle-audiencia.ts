import { Component, ViewChild } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { AudienciasResponse, CancelarAudienciaRequest, CatTipoDocumento } from '../../interfaces/juicioenlinea.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { AuthService } from '../../../core/auth/service/auth.service';
@Component({
  selector: 'app-detalle-audiencia',
 imports: [CommonModule, ButtonModule, DialogModule, ReactiveFormsModule, TooltipModule, ConfirmDialogModule, Spinner],
templateUrl: './detalle-audiencia.html',
  styleUrl: './detalle-audiencia.css',
    providers: [ConfirmationService, MessageService]

})
export class DetalleAudiencia {
 @ViewChild('defaultModal') defaultModal: any;
  isLoading: boolean = false;

  documentoBase64: string | null = null;
  documentoUrl: SafeUrl | null = null;

  idAudiencia!: number;
  detalleAudiencia: AudienciasResponse | null = null;
  visibleAnexo: boolean = false;
  visibleSolicitarGrabacion: boolean = false;

  anexoForm!: FormGroup;
  solicitudForm!: FormGroup;

  formEnviado: boolean = false;
  mostrarInputNombre: boolean = false; // Input de otro* en catalogo tipo documento
  catTipoDocumentos: CatTipoDocumento[] = [];
  acuerdoCancelacion: CancelarAudienciaRequest | null = null; // Para almacenar el acuerdo de cancelación

  constructor(
    private juicioService: JuicioService,
    private router: Router,
    //    private sanitizer: DomSanitizer,
   // private flowbiteService: FlowbiteService,
    private readonly fb: FormBuilder,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
   private authService: AuthService


  ) { }


  ngOnInit(): void {
    //this.flowbiteService.loadFlowbite(() => initFlowbite());
    console.log('Navegando a detalle de audiencia :', this.idAudiencia);

    const state = window.history.state as { idAudiencia: number; tipoMensaje?: 'crear' | 'actualizar' };
    console.log('Estado recibido:', state);

    if (state && state.idAudiencia) {
      this.idAudiencia = state.idAudiencia;
      this.getDetalleExpediente(this.idAudiencia);

      // Mostrar mensaje según el tipo de mensaje
      if (state.tipoMensaje === 'crear') {
        this.messageService.add({
          severity: 'success',
          summary: 'Audiencia programada',
          detail: 'Consulte los detalles de la audiencia.'
        });
      } else if (state.tipoMensaje === 'actualizar') {
        this.messageService.add({
          severity: 'success',
          summary: 'Audiencia repogramada',
          detail: 'Se ha modificado la audiencia.'
        });
      }
    }

    this.anexoForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.maxLength(250)]],
      documento: [null, Validators.required],
    });
    this.solicitudForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.maxLength(250)]],
      solicitudDocumento: [null, Validators.required],
    });
  }

  showModalAnexo() {
    this.visibleAnexo = true;
  }
  showModalReqGrabacion() {
    this.visibleSolicitarGrabacion = true;
  }
 mostrarBoton(): boolean {
  return true;
  //return this.authService.tienePermiso('audiencias/crear');
 }
  getDetalleExpediente(idAudiencia: number): void {
    this.juicioService.getDetalleAudiencia(idAudiencia).subscribe({
      next: (response: any) => {
        console.log('Detalle de la audiencia:', response.data);
        this.detalleAudiencia = response.data || null;

      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
  reprogramarAudiencia() {
    if (this.detalleAudiencia) {
      const fecha = this.detalleAudiencia.start?.split(' ')[0]; // Extrae la fecha del campo `start`
      const [anio, mes, dia] = fecha.split('-'); // Divide la fecha en partes
      const fechaTransformada = `${anio}-${mes}-${dia}`; // Reconstruye la fecha en el formato correcto

      this.router.navigate(['/audiencias/crear'], {
        state: {
          ...this.detalleAudiencia,
          fecha: fechaTransformada // Asegúrate de enviar la fecha transformada
        }
      });
    } else {
      console.error('No se encontró detalleAudiencia para reprogramar.');
    }
  }
  // Método para agregar acuerdo de cancelación
  cancelarAudiencia() {
    this.isLoading = true;
    //console.log('acciona metodo...');

    if (this.anexoForm.invalid) {
      this.anexoForm.markAllAsTouched();
      return;
    }
    //console.log('pasando validaciones...');

    const anexo = this.anexoForm.value;
    if (!(anexo.documento instanceof File)) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Debes seleccionar un archivo.' });
      return;
    }

    // Prepara el FormData
    const formData = new FormData();
    formData.append('observaciones', anexo.observaciones);
    formData.append('documento', anexo.documento);
    formData.append('idCatTipoDocumento', '-1');

    this.juicioService.cancelarAudiencia(this.idAudiencia, formData).subscribe({
      next: (response) => {
        this.isLoading = false;

        //console.log('Acuerdo de cancelación agregado:', response);
        this.messageService.add({ severity: 'info', summary: 'Audiencia Cancelada', detail: 'Audiencia cancelada exitosamente.' });
        this.resetAnexoForm();
        window.location.reload(); // <-- Refresca la página

      },
      error: (error) => {
                this.isLoading = false;

        console.error('Error al agregar acuerdo de cancelación:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la audiencia, contacte con soporte.' });
      }
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.anexoForm.patchValue({
        documento: file,
      });
      this.anexoForm.get('documento')?.markAsTouched();
      this.anexoForm.get('documento')?.updateValueAndValidity();
    }
  }
  resetAnexoForm() {
    this.anexoForm.reset();
    this.visibleAnexo = false;

    const fileInput = document.getElementById('documento') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Restablece el valor del campo de archivo 0.o
    }
  }

  getError(controlName: string, form: FormGroup = this.anexoForm): string {
    const control = form.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control?.hasError('pattern')) {
      return 'Formato inválido';
    } else if (control?.hasError('maxlength')) {
      return 'Se excedió el número máximo de caracteres';
    }

    return '';
  }
  shouldShowError(controlName: string, form: FormGroup = this.anexoForm): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.formEnviado) : false;
  }

  openModal(idDocumento: number): void {
    this.isLoading = true;

    this.juicioService.getDocumento(idDocumento).subscribe({
      next: (response) => {
        this.isLoading = false;

        console.log('Respuesta de getDocumento:', response);
        if (response && response.data && response.data.file) {
          this.documentoBase64 = response.data.file;
          this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${this.documentoBase64}`);
          this.defaultModal.nativeElement.classList.remove('hidden');
          this.defaultModal.nativeElement.classList.add('flex');
        } else {
          console.error('No se encontró contenido base64 para el documento');
        }
      },
      error: (error) => {
        this.isLoading = false;

        console.error('Error al obtener el documento:', error);
      }
    });
  }

  closeModal(): void {
    // Cierra el modal
    this.defaultModal.nativeElement.classList.remove('flex');
    this.defaultModal.nativeElement.classList.add('hidden');
  }
  isEnProgreso(start: string | Date, end: string | Date): boolean {
    const now = new Date();
    const inicio = new Date(start);
    const fin = new Date(end);

    if (now >= inicio && now <= fin) {
      // Refresca 1 segundo antes de que termine la audiencia
      const msToEnd = fin.getTime() - now.getTime() - 1000;
      if (msToEnd > 0) {
        setTimeout(() => {
          window.location.reload();
        }, msToEnd);
      }
      return true;
    }
    return false;
  }

  showPasswords: boolean[] = [];


  togglePassword(index: number): void {
    this.showPasswords[index] = true;

    // Copiar al portapapeles
    const input = document.getElementById(`password-${index}`) as HTMLInputElement;
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
    }

    // Ocultar después de 3 segundos
    setTimeout(() => {
      this.showPasswords[index] = false;
    }, 3000);
  }

  solicitudDeAudiencia() {
    console.log('Accionando método solicitudDeAudiencia...');
    this.isLoading = true;
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }
    console.log('Pasando validaciones...');

    const solicitud = this.solicitudForm.value;
    if (!(solicitud.solicitudDocumento instanceof File)) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Debes seleccionar un archivo.' });
      return;
    }

    // Prepara el FormData
    const formData = new FormData();
    formData.append('idAudiencia', this.idAudiencia.toString()); // Agrega el idAudiencia al FormData
    formData.append('observaciones', solicitud.observaciones.toUpperCase());
    formData.append('documento', solicitud.solicitudDocumento);


    this.juicioService.solicitarAudiencia(formData).subscribe({
      next: (response) => {
        if (response.status === 201) {
          this.isLoading = false;
          console.log('Solicitud de audiencia enviada:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Solicitud enviada',
            detail: 'La solicitud de audiencia se ha enviado exitosamente.'
          });
          this.resetSolicitudForm();
          // this.visibleSolicitarGrabacion = false; // <-- fuerza el cierre del modal

        }
      },
      error: (error) => {
        this.isLoading = false;

        console.error('Error al enviar la solicitud de audiencia:', error);
        this.resetSolicitudForm();
    // Extraemos el mensaje de la API o usamos un fallback
    const apiMsg = error?.error?.message 
      || error?.message 
      || 'Ya existe una solicitud para esta audiencia.';

        if (error.status === 409) {
          this.messageService.add({
            severity: 'info',
            summary: 'Solicitud pendiente',
            detail: apiMsg
          });
        } else if (error.status === 403) {
          this.messageService.add({
            severity: 'info',
            summary: 'Solicitud pendiente',
            detail: apiMsg
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo enviar la solicitud de audiencia, contacte con soporte.'
          });
        }
      }
    });
  }

  onFileSelectedSolicitud(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.solicitudForm.patchValue({
        solicitudDocumento: file,
      });
      this.solicitudForm.get('solicitudDocumento')?.markAsTouched();
      this.solicitudForm.get('solicitudDocumento')?.updateValueAndValidity();
    }
  }

  resetSolicitudForm() {
    this.solicitudForm.reset();
    this.visibleSolicitarGrabacion = false;
    console.log('Cerrando modal de solicitud de grabación');
    const fileInput = document.getElementById('solicitudDocumento') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  isArrayAndNotEmpty(arr: any): boolean {
    return Array.isArray(arr) && arr.length > 0;
  }

  confirmSolicitud(event: Event) {
    this.confirmationService.confirm({
      key: 'cancelarAudiencia',
      target: event.target as EventTarget,
      accept: () => this.cancelarAudiencia(),
      reject: () => { }
    });
  }
    confirmarSolcitudGrabacion(event: Event) {
    this.confirmationService.confirm({
      key: 'solicitudGrabacion',
      target: event.target as EventTarget,
      accept: () => this.solicitudDeAudiencia(),
      reject: () => { }
    });
  }
}
