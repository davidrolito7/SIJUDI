import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// ============================
// PrimeNG
// ============================
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// ============================
// App - shared
// ============================
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
import { base64ToFile } from '../../../shared/functions/utils';

// ============================
// App - feature
// ============================
import { JuicioService } from '../../services/juicioenlinea.service';
import { PantallasService } from '../../services/pantallas.service';
import { DetalleTramites, Partes } from '../../interfaces/juicioenlinea.model';

@Component({
  selector: 'app-detalle-tramite',
  imports: [
    CommonModule,
    // PrimeNG
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    // Shared
    Breadcrub,
    Spinner,
    PdfDialog,
  ],
  templateUrl: './detalle-tramite.html',
  styleUrl: './detalle-tramite.css',
  providers: [MessageService],
})
export class DetalleTramite implements OnInit {

  // ============================
  // Data
  // ============================
  idTramite: number | undefined;
  detalleTramite: DetalleTramites | null = null;
  partesTramite: Partes[] = [];
  anexos: any[] = [];

  // ============================
  // Documento / PDF
  // ============================
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);

  // ============================
  // UI
  // ============================
  isLoading = false;

  constructor(
    private readonly juicioService: JuicioService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: MessageService,
    private readonly au: PantallasService,
  ) {}

  // ============================
  // Lifecycle
  // ============================
  ngOnInit(): void {
    const state = window.history.state as { idTramite: number; mensajeExito?: string };

    if (state?.idTramite) {
      this.idTramite = state.idTramite;
      this.getDetalleTramite(this.idTramite);
    }

    const mensaje = state?.mensajeExito || sessionStorage.getItem('mensajeExito');
    if (mensaje) {
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje });
      sessionStorage.removeItem('mensajeExito');
    }
  }

  // ============================
  // Data
  // ============================
  getDetalleTramite(idTramite: number): void {
    this.isLoading = true;
    this.juicioService.getDetalleTramite(idTramite).subscribe({
      next: (response: any) => {
        this.detalleTramite = response.data || null;
        this.partesTramite = this.detalleTramite?.partes_tramite ?? [];

        // Construir array de anexos a partir del documento del trámite
        if (this.detalleTramite?.documento) {
          this.anexos = [this.detalleTramite.documento];
        } else {
          this.anexos = [];
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleTramite = null;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ============================
  // Documento PDF — igual que detalle-demanda
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
      },
    });
  }

  // ============================
  // Navegación
  // ============================
  detalle(idExpediente: number): void {
    this.router.navigate(['/juicioenlinea/acuerdos/crear'], { state: { idExpediente } });
  }

  // ============================
  // Estado — igual que listar-tramite
  // ============================
  getEstadoDescripcion(tramite: unknown): string | null {
    const t = tramite as { historial?: Array<{ cat_estado_tramite?: { nombre?: string } }> };
    const historial = t.historial;
    if (!historial || historial.length === 0) return null;
    return historial[historial.length - 1]?.cat_estado_tramite?.nombre ?? null;
  }

  getEstadoId(tramite: unknown): number | null {
    const t = tramite as { historial?: Array<{ idCatEstadoTramite?: number | string }> };
    const historial = t.historial;
    if (!historial || historial.length === 0) return null;
    const id = historial[historial.length - 1]?.idCatEstadoTramite;
    return id != null ? Number(id) : null;
  }

  getEstadoTag(tramite: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(tramite);
    switch (id) {
      case 1:  return { severity: 'info',      icon: 'pi pi-send' };
      case 2:  return { severity: 'success',   icon: 'pi pi-check' };
      case 10002: return { severity: 'warn',   icon: 'pi pi-file-edit' };
      default: return { severity: 'secondary' };
    }
  }

  // ============================
  // Helpers
  // ============================
  mostrarBoton(): boolean {
    return this.au.tienePermiso('requerimiento/crear');
  }
}