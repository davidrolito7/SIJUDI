import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TerminosService } from '../../service/terminos.service';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";

@Component({
  selector: 'app-buscarTerminos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TableModule,
    MessageModule,
    ToastModule,
    Breadcrub
],
  templateUrl: './buscar-terminos.html',
  styleUrl: './buscar-terminos.css',
  providers: [MessageService]
})
export class buscarTerminosComponent {

  // ==================================================
  // Filtros de búsqueda
  // ==================================================
  instancia: 'P' | 'S' = 'P';
  tipoBusqueda = 'Folio';
  valorBusqueda = '';

  // ==================================================
  // Estado de resultados
  // ==================================================
  resultados: any[] = [];
  busquedaRealizada = false;

  // ==================================================
  // Expresiones regulares de validación
  // ==================================================
  private readonly FOLIO_PRIMERA_REGEX = /^P-\d{1,5}\/\d{4}$/;
  private readonly FOLIO_SEGUNDA_REGEX = /^S-\d{1,5}\/\d{4}$/;
  private readonly EXPEDIENTE_REGEX = /^\d{4}\/\d{4}$/;

  // ==================================================
  // Referencias de vista
  // ==================================================
  @ViewChild('valorBusquedaInput', { read: ElementRef })
  valorBusquedaInput!: ElementRef;

  // ==================================================
  // Catálogos
  // ==================================================
  instancias = [
    { label: 'Primera Instancia', value: 'P' },
    { label: 'Segunda Instancia', value: 'S' }
  ];

  tiposBusqueda = [
    { label: 'Folio', value: 'Folio' },
    { label: 'Expediente', value: 'Expediente' }
  ];

  constructor(
    private apiService: TerminosService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) { }

  // ==================================================
  // Ejecuta la búsqueda de escritos
  // ==================================================
  buscar(): void {

    if (!this.valorBusqueda || !this.valorBusqueda.trim()) {
      this.mostrarErrorBusqueda('Captura un valor para buscar');
      return;
    }

    if (!this.instancia || !this.tipoBusqueda) {
      return;
    }

    const valor = this.valorBusqueda.trim().toUpperCase();
    const tipo = this.tipoBusqueda.toUpperCase();

    if (tipo === 'FOLIO') {
      const regex = this.instancia === 'P'
        ? this.FOLIO_PRIMERA_REGEX
        : this.FOLIO_SEGUNDA_REGEX;

      if (!regex.test(valor)) {
        const ejemplo = this.instancia === 'P'
          ? 'P-2845/2026'
          : 'S-242/2007';

        this.mostrarErrorBusqueda(
          `Formato de folio inválido. Ejemplo: ${ejemplo}`
        );
        return;
      }
    }

    if (tipo === 'EXPEDIENTE') {
      if (!this.EXPEDIENTE_REGEX.test(valor)) {
        this.mostrarErrorBusqueda(
          'Formato de expediente inválido. Ejemplo: 0001/2026'
        );
        return;
      }
    }

    this.busquedaRealizada = false;
    this.resultados = [];

    this.apiService.buscarEscritos({
      instancia: this.instancia,
      tipoBusqueda: this.tipoBusqueda,
      valor
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.resultados = res.data ?? [];
        } else {
          this.resultados = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin resultados',
            detail: res.message
          });
        }

        this.busquedaRealizada = true;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);

        this.resultados = [];
        this.busquedaRealizada = true;
        this.cdr.detectChanges();

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo realizar la búsqueda'
        });
      }
    });
  }

  // ==================================================
  // Limpia filtros y resultados
  // ==================================================
  limpiarFiltros(): void {
    this.instancia = 'P';
    this.tipoBusqueda = 'Folio';
    this.valorBusqueda = '';
    this.resultados = [];
    this.busquedaRealizada = false;
  }

  // ==================================================
  // Navega al detalle del escrito
  // ==================================================
  verEscrito(folio: string): void {
    const instancia = folio.startsWith('S-')
      ? 'terminossegundainstancia'
      : 'terminosprimerainstancia';

    this.router.navigate([`/terminos/${instancia}`], {
      queryParams: { folio }
    });
  }

  // ==================================================
  // Muestra mensaje de error de búsqueda
  // ==================================================
  private mostrarErrorBusqueda(mensaje: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Búsqueda inválida',
      detail: mensaje,
      life: 4000
    });

    setTimeout(() => {
      this.valorBusquedaInput?.nativeElement?.focus();
    });
  }
}
