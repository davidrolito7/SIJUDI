import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { DetalleInicioResponse } from '../../interfaces/juicioenlinea.model';
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

@Component({
  selector: 'app-detalle-demanda',
  imports: [CommonModule, TableModule, Breadcrub, ButtonModule, TagModule, PdfDialog, TooltipModule],
  templateUrl: './detalle-demanda.html',
  styleUrl: './detalle-demanda.css',
})
export class DetalleDemanda implements OnInit {

  idInicio: number | undefined;
  nombre: string = '';
  documentoUrl: SafeResourceUrl | null = null;
  detalleInicio: DetalleInicioResponse | null = null;
  isLoading = false;
  mostrarDocumento = signal<boolean>(false);

  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const state = window.history.state as { idInicio: number };

    if (state?.idInicio) {
      this.idInicio = state.idInicio;
      this.getDetalleInicio(this.idInicio);
    } else {
      this.router.navigate(['/layout/inicio']);
    }
  }

  getDetalleInicio(idInicio: number): void {
    this.juicioService.getDetalleInicios(idInicio).subscribe({
      next: (response: any) => {
        this.detalleInicio = response.data || null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleInicio = null;
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
