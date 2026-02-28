import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
// Shared
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { base64ToFile } from '../../../shared/functions/utils';

// Feature
import { ListadoAcuerdosResponse } from '../../interfaces/juicioenlinea.model';
import { JuicioService } from '../../services/juicioenlinea.service';
import { AuthService } from '../../../core/auth/service/auth.service';
import { PantallasService } from '../../services/pantallas.service';

@Component({
  selector: 'app-detalle-acuerdo',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // PrimeNG
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    InputGroupModule,
    InputGroupAddonModule,
    ConfirmDialogModule,
    InputTextModule,
    // Shared
    Breadcrub,
    PdfDialog,
    Spinner,
  ],
  templateUrl: './detalle-acuerdo.html',
  styleUrl: './detalle-acuerdo.css',
  providers: [ConfirmationService, MessageService],
})
export class DetalleAcuerdo implements OnInit {

  // ============================
  // State
  // ============================
  idAcuerdo: number | undefined;
  detalleAcuerdo!: ListadoAcuerdosResponse;
  isLoading = false;

  // PDF viewer
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);

  // FIREL
  firmaForm!: FormGroup;
  firmaVerificada = false;
  showPassword = false;

  // ============================
  // Constructor / DI
  // ============================
  constructor(
    private juicioService: JuicioService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private pantallasService: PantallasService

  ) { }

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    const state = window.history.state as { idAcuerdo: number };

    if (state?.idAcuerdo) {
      this.idAcuerdo = state.idAcuerdo;
      this.getDetalleAcuerdo(this.idAcuerdo);
    } else {
      this.router.navigate(['/layout/inicio']);
    }

    this.firmaForm = this.fb.group({
      password_Efirma: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  // ============================
  // Data
  // ============================
  getDetalleAcuerdo(idAcuerdo: number): void {
    this.isLoading = true;
    this.juicioService.getDetalleAcuerdo(idAcuerdo).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.detalleAcuerdo = response.data ?? null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error:', error);
        this.cdr.markForCheck();
      },
    });
  }

  // ============================
  // PDF Viewer
  // ============================
  onVerDocumento(fileBase64: string, nombre: string, mime: string): void {
    const file = base64ToFile(fileBase64, nombre, mime);
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  }

  openModal(idDocumento: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.juicioService.getDocumentoAcuerdo(idDocumento).subscribe({
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
      },
    });
  }

  // ============================
  // FIREL
  // ============================

  mostrarBoton(): boolean {
    return this.pantallasService.tienePermiso('demandas/crear') && this.pantallasService.tienePermiso('audiencias/crear') ;
  }

  autorizarFirel(event: Event): void {
    this.confirmationService.confirm({
      key: 'firma',
      target: event.target as EventTarget,
      accept: () => this.onVerificarFirma(),
      reject: () => { },
    });
  }

  onVerificarFirma(): void {
    if (typeof this.idAcuerdo !== 'number') {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontró el id del acuerdo.' });
      return;
    }

    this.isLoading = true;
    const request = { password_Efirma: this.firmaForm.value.password_Efirma };

    this.juicioService.multifirmaAcuerdo(request, this.idAcuerdo).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.success) {
          this.firmaVerificada = true;
          this.messageService.add({ severity: 'success', summary: 'Firma verificada', detail: 'La firma digital es válida.' });
          this.getDetalleAcuerdo(this.idAcuerdo!);
        } else {
          this.messageService.add({ severity: 'info', summary: 'Lo sentimos', detail: response?.message });
          this.firmaForm.reset();
        }
      },
      error: () => {
        this.isLoading = false;
        this.firmaForm.reset();
      },
    });
  }

  // ============================
  // Navegación
  // ============================
  detalle(idTramite: number): void {
    this.router.navigate(['/tramites/detalle'], { state: { idTramite } });
  }
}