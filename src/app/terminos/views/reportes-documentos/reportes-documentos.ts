import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TerminosService } from '../../service/terminos.service';
import { CatJuzgados, CatSalas } from '../../interface/terminos.model';
import { ChangeDetectorRef } from '@angular/core';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Header } from "../../../shared/components/header/header";



@Component({
  selector: 'app-reportes-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    ToastModule,
    Spinner, Header
  ],
  templateUrl: './reportes-documentos.html',
  styleUrls: ['./reportes-documentos.css'],
  providers: [MessageService]
})

/**
 * Componente encargado de generar reportes de documentos en formato PDF
 * filtrados por instancia, órgano jurisdiccional y rango de fechas.
 * 
 * Responsabilidades:
 * - Cargar catálogos desde el backend
 * - Validar filtros
 * - Generar y descargar el PDF
 * - Manejar estados de carga y notificaciones
 */
export class ReportesDocumentosComponent implements OnInit {

  /** Indica si el componente ya está listo (uso opcional) */
  ready = true;

  /** Controla el estado de carga mientras se genera el reporte */
  isLoading = false;

  // ==================================================
  // Filtros del reporte
  // ==================================================

  /** Tipo de instancia seleccionada */
  instancia: 'P' | 'S' = 'P';

  /** Identificador del juzgado seleccionado */
  juzgado: string | null = null;

  /** Identificador de la sala seleccionada */
  sala: string | null = null;

  /** Fecha inicial del rango */
  fechaInicio: Date | null = null;

  /** Fecha final del rango */
  fechaFin: Date | null = null;

  // ==================================================
  // Referencias a controles de la vista
  // ==================================================

  /** Referencia al input de fecha inicial */
  @ViewChild('fechaInicioInput', { read: ElementRef })
  fechaInicioInput!: ElementRef;

  /** Referencia al input de fecha final */
  @ViewChild('fechaFinInput', { read: ElementRef })
  fechaFinInput!: ElementRef;

  /** Referencia al select de juzgado */
  @ViewChild('juzgadoSelect', { read: ElementRef })
  juzgadoSelect!: ElementRef;

  /** Referencia al select de sala */
  @ViewChild('salaSelect', { read: ElementRef })
  salaSelect!: ElementRef;

  // ==================================================
  // Catálogos
  // ==================================================

  /** Catálogo de juzgados de primera instancia */
  catalogoJuzgados: CatJuzgados[] = [];

  /** Catálogo de salas de segunda instancia */
  catalogoSalas: CatSalas[] = [];

  /** Fecha máxima permitida (hoy) */
  maxDate: Date = new Date();

  /** Opciones de instancia para el select */
  instancias = [
    { label: 'Primera Instancia', value: 'P' },
    { label: 'Segunda Instancia', value: 'S' }
  ];

  constructor(
    private apiService: TerminosService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  /**
   * Obtiene los catálogos de juzgados y salas desde el backend
   * para poblar los selects del formulario.
   */
  cargarCatalogos(): void {

    this.apiService.getCatalogoJuzgadosPrimeraInstancia().subscribe({
      next: res => {
        this.catalogoJuzgados = res.success ? (res.data ?? []) : [];
      },
      error: err => {
        console.error(err);
        this.catalogoJuzgados = [];
      }
    });

    this.apiService.getCatalogoSalasSegundaInstancia().subscribe({
      next: res => {
        this.catalogoSalas = res.success ? (res.data ?? []) : [];
      },
      error: err => {
        console.error(err);
        this.catalogoSalas = [];
      }
    });
  }

  // ==================================================
  // Control de selección
  // ==================================================

  /** Reinicia órganos seleccionados cuando cambia la instancia */
  onInstanciaChange(): void {
    this.juzgado = null;
    this.sala = null;
  }

  /** Garantiza que solo un órgano esté seleccionado */
  onJuzgadoChange(): void {
    if (this.juzgado) {
      this.sala = null;
    }
  }

  /** Garantiza que solo un órgano esté seleccionado */
  onSalaChange(): void {
    if (this.sala) {
      this.juzgado = null;
    }
  }

  /**
   * Genera el reporte en formato PDF basado en los filtros seleccionados.
   * 
   * Flujo:
   * 1. Valida el rango de fechas.
   * 2. Activa estado de carga.
   * 3. Envía parámetros al backend.
   * 4. Descarga el archivo si es válido.
   * 5. Muestra mensajes informativos o de error.
   */
generarPdf(): void {

  // 🔎 Validación
  if (!this.fechaInicio || !this.fechaFin) {

    this.messageService.add({
      severity: 'warn',
      summary: 'Fechas requeridas',
      detail: 'Debes seleccionar un rango de fechas',
      life: 4000
    });

    setTimeout(() => {
      if (!this.fechaInicio) {
        this.fechaInicioInput.nativeElement
          .querySelector('input')
          ?.focus();
      } else {
        this.fechaFinInput.nativeElement
          .querySelector('input')
          ?.focus();
      }
    });

    return;
  }

  // 🔄 Activamos loading
  this.isLoading = true;
  this.cdr.markForCheck();

  const params = {
    instancia: this.instancia,
    juzgado: this.instancia === 'P' ? this.juzgado ?? '' : '',
    sala: this.instancia === 'S' ? this.sala ?? '' : '',
    fechaInicio: this.formatDate(this.fechaInicio),
    fechaFin: this.formatDate(this.fechaFin)
  };

  this.apiService.generarReporteDocumentosPdf(params)
    .subscribe({

      next: (response: Blob) => {

        if (response.type === 'application/pdf') {

          const blobUrl = window.URL.createObjectURL(response);

          // 🔥 Abrimos directamente el PDF (visor nativo)
          window.open(blobUrl, '_blank');

        } else {

          this.messageService.add({
            severity: 'info',
            summary: 'Sin resultados',
            detail: 'No se encontraron registros para los filtros seleccionados.',
            life: 4000
          });

        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: err => {

        console.error(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error del sistema',
          detail: 'Ocurrió un problema al generar el reporte.',
          life: 4000
        });

        this.isLoading = false;
        this.cdr.markForCheck();
      }

    });
}
  /**
   * Restablece todos los filtros del formulario a su estado inicial.
   */
  limpiar(): void {
    this.instancia = 'P';
    this.juzgado = null;
    this.sala = null;
    this.fechaInicio = null;
    this.fechaFin = null;
  }

  /**
   * Convierte una fecha a formato YYYY-MM-DD requerido por el backend.
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}


