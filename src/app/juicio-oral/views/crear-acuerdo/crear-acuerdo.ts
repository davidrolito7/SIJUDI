import { Component, ElementRef, OnInit, signal, Signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
// Shared
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

// Feature
import { DetalleExpedienteResponse } from '../../interfaces/juicioenlinea.model';
import { JuicioService } from '../../services/juicioenlinea.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-crear-acuerdo',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
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
    // Shared
    Breadcrub,
    Spinner,
    ConfirmDialog,
    ConfirmDialogModule
  ],
  templateUrl: './crear-acuerdo.html',
  styleUrl: './crear-acuerdo.css',
  providers: [ConfirmationService, MessageService],
})
export class CrearAcuerdo implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;

  // ============================
  // State
  // ============================
  isLoading = signal<boolean>(false);
  expediente: DetalleExpedienteResponse | null = null;
  idExpediente: number | undefined;

  acuerdo!: FormGroup;

  isAllSelected = false;
  selectedTramites: any[] = [];

  // Documento subido
  nombreArchivo = '';
  uploadFile: File | null = null;
  archivoUrl: string | null = null;

  // Visor PDF
  visibleDocumento = false;
  documentoUrl: SafeUrl | null = null;

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

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    const state = window.history.state as { idExpediente: number };

    if (state?.idExpediente) {
      this.idExpediente = state.idExpediente;
      this.getTramitesExpediente(this.idExpediente);
    } else {
      this.router.navigate(['/acuerdo/crear']);
    }

    this.acuerdo = this.fb.group({
      sintesis: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      observaciones: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      documento: [null, Validators.required],
    });
  }

  // ============================
  // Data
  // ============================
  getTramitesExpediente(idExpediente: number): void {
    this.isLoading.set(true);
    this.juicioService.getTramitesExpediente(idExpediente).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.expediente = response.data;
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  // ============================
  // Selección de tramites
  // ============================
  toggleSelectAll(): void {
    this.isAllSelected = !this.isAllSelected;
    this.selectedTramites = this.isAllSelected
      ? [...(this.expediente?.tramites ?? [])]
      : [];
  }

  toggleSelection(tramite: any): void {
    const index = this.selectedTramites.findIndex(t => t === tramite);
    if (index > -1) {
      this.selectedTramites.splice(index, 1);
    } else {
      this.selectedTramites.push(tramite);
    }
    this.isAllSelected = this.selectedTramites.length === this.expediente?.tramites.length;
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

  // ============================
  // Visor PDF desde servidor
  // ============================
  // openModal(idDocumento: number): void {
  //   this.isLoading.set(true);
  //   this.juicioService.getDocumento(idDocumento).subscribe({
  //     next: (response) => {
  //       this.isLoading.set(false);
  //       if (response?.data?.file) {
  //         const byteCharacters = atob(response.data.file);
  //         const byteArray = new Uint8Array(byteCharacters.length);
  //         for (let i = 0; i < byteCharacters.length; i++) {
  //           byteArray[i] = byteCharacters.charCodeAt(i);
  //         }
  //         const blob = new Blob([byteArray], { type: 'application/pdf' });
  //         const blobUrl = URL.createObjectURL(blob);
  //         this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
  //         this.visibleDocumento = true;
  //       }
  //     },
  //     error: () => {
  //       this.isLoading.set(false);
  //     },
  //   });
  // }



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

    const values = this.acuerdo.value;
    if (!(values.documento instanceof File)) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Debes seleccionar un archivo.' });
      return;
    }

    const formData = new FormData();
    formData.append('idExpediente', String(this.expediente?.idExpediente ?? ''));
    formData.append('observaciones', values.observaciones.toUpperCase());
    formData.append('sintesis', values.sintesis.toUpperCase());
    formData.append('documento', values.documento);
    
    let idDemandaAgregada = false;
    this.selectedTramites.forEach(t => {
      if (t.idTramite) {
        formData.append('idTramite[]', t.idTramite.toString());
      }
      if (t.idDemanda && !idDemandaAgregada) {
        formData.append('idDemanda', t.idDemanda.toString());
        idDemandaAgregada = true;
      }
    });

    this.isLoading.set(true);
    this.juicioService.postAcuerdo(formData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.status === 200) {
          this.messageService.add({ severity: 'success', summary: 'Acuerdo creado', detail: 'Acuerdo enviado al juez para firma.' });
          this.acuerdo.reset();
          this.selectedTramites = [];
          this.quitarArchivo();
          this.detalle(response.data.idAcuerdo);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.acuerdo.reset();
        this.selectedTramites = [];
        this.quitarArchivo();
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
    if (control?.hasError('pattern')) return 'Formato inválido';
    return '';
  }

  // ============================
  // Estado helpers for UI tags
  // ============================
  getEstadoDescripcion(tramite: unknown): string | null {
    const i = tramite as { ultimo_estado?: { cat_estado_tramite?: { nombre?: string } } };
    return i.ultimo_estado?.cat_estado_tramite?.nombre ?? null;
  }

  getEstadoId(tramite: unknown): number | null {
    const i = tramite as { ultimo_estado?: { cat_estado_tramite?: { idCatEstadoTramite?: number } } };
    return i.ultimo_estado?.cat_estado_tramite?.idCatEstadoTramite ?? null;
  }

  getEstadoTag(tramite: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(tramite);
    switch (id) {
      case 0:
        return { severity: 'success', icon: 'pi pi-file-send' };
      case 1:
        return { severity: 'secondary', icon: 'pi pi-send' };
      case 2:
        return { severity: 'info', icon: 'pi pi-clock' };
      case 3:
        return { severity: 'success', icon: 'pi pi-check' };
      default:
        return { severity: 'secondary', icon: 'pi pi-question' };
    }
  }

  getDescripcionTramite(tramite: unknown): string | null {
    const i = tramite as { cat_tramite?: { nombre?: string } };
    return i.cat_tramite?.nombre ?? null;
  }

  getIdTramite(tramite: unknown): number | null {
    const i = tramite as { cat_tramite?: { idCatTramite?: number } };
    return i.cat_tramite?.idCatTramite ?? null;
  }

  getTagTramite(tramite: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getIdTramite(tramite);
    switch (id) {
      case 0:
        return { severity: 'success', icon: 'pi pi-file-pdf' };
      case 1:
        return { severity: 'info', icon: 'pi pi-file-pdf' };
      case 2:
        return { severity: 'warn', icon: 'pi pi-flag' };
      case 3:
        return { severity: 'secondary', icon: 'pi pi-check' };
      default:
        return { severity: 'secondary', icon: 'pi pi-question' };
    }
  }


}