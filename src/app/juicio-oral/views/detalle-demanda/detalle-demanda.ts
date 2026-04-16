import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { TooltipModule } from 'primeng/tooltip';
import { base64ToFile } from '../../../shared/functions/utils';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { DetalleDemandaResponse } from '../../interfaces/juicioenlinea.model';

@Component({
  selector: 'app-detalle-demanda',
  imports: [CommonModule, TableModule, Breadcrub, ButtonModule, TagModule, PdfDialog, TooltipModule, Spinner],
  templateUrl: './detalle-demanda.html',
  styleUrl: './detalle-demanda.css',
})
export class DetalleDemanda implements OnInit {

  idInicio: number | undefined;
  nombre: string = '';
  documentoUrl: SafeResourceUrl | null = null;
  detalleDemanda: DetalleDemandaResponse | null = null;
  isLoading = false;

  mostrarDocumento = signal<boolean>(false);

  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const state = window.history.state as { idExpediente: number };

    if (state?.idExpediente) {
      this.idInicio = state.idExpediente;
      this.getDetalleInicio(this.idInicio);
    } else {
      console.warn('No se proporcionó idExpediente. Redirigiendo a la página de inicio.');
    // this.router.navigate(['/layout/inicio']);
    }
  }

  getDetalleInicio(idExpediente: number): void {
    this.juicioService.getDetalleInicios(idExpediente).subscribe({
      next: (response: any) => {
        this.detalleDemanda = response.data || null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleDemanda = null;
        this.cdr.markForCheck();
      }
    });
  }

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
      }
    });
  }
}
