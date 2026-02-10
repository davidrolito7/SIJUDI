import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-detalle-demanda',
  imports: [CommonModule, TableModule, Breadcrub, ButtonModule, TagModule, PdfDialog, TooltipModule],
  templateUrl: './detalle-demanda.html',
  styleUrl: './detalle-demanda.css',
})
export class DetalleDemanda implements OnInit {

  idInicio: number | undefined;
  nombre: string = '';
  documentoUrl: string | null = null;  // ← string, NO SafeResourceUrl
  detalleInicio: DetalleInicioResponse | null = null;
  isLoading = false;
  mostrarDocumento = false;

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

  openModal(idDocumento: number): void {
    this.isLoading = true;

    this.juicioService.getDocumento(idDocumento).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response?.data?.file) {
          const byteCharacters = atob(response.data.file);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          // ✅ Pasa el string puro, PdfDialog ya sanitiza internamente
          this.documentoUrl = URL.createObjectURL(blob);
          this.nombre = response.data.nombre

          this.mostrarDocumento = true;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al obtener el documento:', error);
        this.cdr.markForCheck();
      }
    });
  }
}
