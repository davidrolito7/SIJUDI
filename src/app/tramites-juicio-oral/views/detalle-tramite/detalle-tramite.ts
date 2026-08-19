import { Component, signal, inject, OnInit } from '@angular/core';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { ApiService } from '../../service/api.service';
import { DetalleTramiteElectronicoRecibidoResponse } from '../../interface/tramites-juicio-oral.model';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TooltipModule } from 'primeng/tooltip';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog"; // ajusta el path
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-detalle-tramite',
  imports: [Spinner, DatePipe, TableModule, ButtonModule, TooltipModule, PdfDialog, TagModule],
  templateUrl: './detalle-tramite.html',
  styleUrl: './detalle-tramite.css',
})
export class DetalleTramite implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly apiService = inject(ApiService);

  isLoading = signal(false);
  idTramiteElectronicoRecibido: number | undefined;
  detalleTramiteElectronicoRecibido: DetalleTramiteElectronicoRecibidoResponse | null = null;

  // PDF dialog
  mostrarDocumento = signal(false);
  documentoUrl: SafeResourceUrl | null = null;
  nombre = '';

  ngOnInit(): void {
    const state = window.history.state as { idTramiteElectronicoRecibido: number };
    if (state?.idTramiteElectronicoRecibido) {
      this.idTramiteElectronicoRecibido = state.idTramiteElectronicoRecibido;
      this.getDetalleInicio(this.idTramiteElectronicoRecibido);
    } else {
      console.warn('No se proporcionó idTramiteElectronicoRecibido.');
    }
  }

  getDetalleInicio(idTramiteElectronicoRecibido: number): void {
    this.isLoading.set(true);
    this.apiService.getDetalleTramiteElectronicoRecibido({ idTramiteElectronicoRecibido }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        this.detalleTramiteElectronicoRecibido = response.data || null;
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleTramiteElectronicoRecibido = null;
      }
    });
  }

  openModal(referencia : string): void {
    this.isLoading.set(true);

    this.apiService.getDocumentoNas(referencia).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        if (response?.data?.file) {
          this.onVerDocumento(response.data.file, response.data.fileName, 'application/pdf');
        }
      },
      error: (error) => {
        console.error('Error al obtener el documento:', error);
      }
    });
  }

  onVerDocumento(fileBase64: string, nombre: string, mime: string): void {
      this.nombre = nombre; 
    const byteChars = atob(fileBase64);
    const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });
    const url = URL.createObjectURL(blob);
    this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.mostrarDocumento.set(true);
  }
}

