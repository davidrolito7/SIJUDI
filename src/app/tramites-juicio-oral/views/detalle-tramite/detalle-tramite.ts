import { Component, signal, inject } from '@angular/core';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
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
@Component({
  selector: 'app-detalle-tramite',
  imports: [Breadcrub, Spinner, DatePipe, TableModule, ButtonModule, TooltipModule, PdfDialog, TagModule],
  templateUrl: './detalle-tramite.html',
  styleUrl: './detalle-tramite.css',
})
export class DetalleTramite {
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
    this.apiService.getDetalleTramiteElectronicoRecibido({ idTramiteElectronicoRecibido }).subscribe({

      next: (response: any) => {
        this.isLoading.set(false);
        this.detalleTramiteElectronicoRecibido = response.data || null;
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error:', error);
        this.detalleTramiteElectronicoRecibido = null;
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  openModal(archivo: { url: string; nombreArchivo: string }): void {
    this.isLoading.set(true);
    const fileName = archivo.nombreArchivo; // "REFERENCIA_PAGO_147753.pdf"

    this.apiService.getDocumentoNas({ path: archivo.url + '/', fileName: archivo.nombreArchivo }).subscribe({
      next: (response) => {
        if (response?.data?.file) {
          this.nombre = fileName;
          this.onVerDocumento(response.data.file, fileName, 'application/pdf');
        }
         this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al obtener el documento:', error);
        this.isLoading.set(false);
      },
      complete: () => {  this.isLoading.set(false); }
    });
  }

  onVerDocumento(fileBase64: string, nombre: string, mime: string): void {
    const byteChars = atob(fileBase64);
    const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });
    const url = URL.createObjectURL(blob);
    this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.mostrarDocumento.set(true);
  }
}