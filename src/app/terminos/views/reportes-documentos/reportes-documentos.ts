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
import { TableModule } from "primeng/table";
import { MessageModule } from "primeng/message";



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
    Spinner, Header,
    TableModule,
    MessageModule
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

  private readonly FOLIO_PRIMERA_REGEX = /^P-\d{1,5}\/\d{4}$/;
  private readonly FOLIO_SEGUNDA_REGEX = /^S-\d{1,5}\/\d{4}$/;
  @ViewChild('resultadosSection')
  resultadosSection!: ElementRef;

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

  folio = '';
  expediente = '';

  // ==================================================
  // Estado de resultados
  // ==================================================
  resultados: any[] = [];
  busquedaRealizada = false;

  usuarios: any[] = [];

  usuarioRecibio: string | null = null;
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
    this.apiService.getUsuariosConEscritos().subscribe({
      next: (data) => {
        this.usuarios = data.filter(
          (u) => u.nombre?.trim().toLowerCase() !== 'administrador del sistema',
        );
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
      },
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
/*generarPdf(): void {

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
}*/
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
  onFechaInicioChange(): void {
    if (!this.fechaInicio) {
      return;
    }

    this.fechaFin = new Date(this.fechaInicio);
  }
  descargarPdf(): void {
    const params = this.obtenerFiltros();
    this.isLoading = true;
    this.cdr.detectChanges();
    this.apiService.generarReportePdf(params).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        window.open(url, '_blank');

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        //console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No fue posible generar el reporte PDF.',
        });
      },
    });
  }
  descargarExcel(): void {
    const params = this.obtenerFiltros();
    this.isLoading = true;
    this.cdr.detectChanges();

    this.apiService.generarReporteExcel(params).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;
        link.download = 'ReporteEscritos.xlsx';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No fue posible generar el reporte Excel.',
        });
      },
    });
  }
  private obtenerFiltros() {
    return {
      instancia: this.instancia!,
      juzgado: this.instancia === 'P' ? (this.juzgado ?? '') : (this.sala ?? ''),

      folio: this.folio.trim(),
      expediente: this.expediente.trim(),

      fechaInicio: this.fechaInicio ? this.fechaInicio.toISOString() : '',

      fechaFin: this.fechaFin ? this.fechaFin.toISOString() : '',

      personaRecibe: this.usuarioRecibio ?? '',
      personaCertifica: '',
    };
  }
  buscar(): void {
    if (!this.instancia) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una instancia',
      });

      return;
    }

    const tieneFiltro =
      !!this.juzgado ||
      !!this.sala ||
      !!this.folio.trim() ||
      !!this.expediente.trim() ||
      !!this.usuarioRecibio ||
      !!this.fechaInicio;

    if (!tieneFiltro) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtros insuficientes',
        detail:
          'Debe capturar al menos un criterio adicional de búsqueda (Juzgado/Sala, Fecha, Folio, Expediente o Quien recibió).',
      });

      return;
    }

    /*if (!this.fechaInicio || !this.fechaFin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Debe seleccionar un rango de fechas',
      });

      return;
    }*/
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fechas inválidas',
        detail: 'La fecha inicial no puede ser mayor a la fecha final',
      });

      return;
    }
    /*if (!this.fechaInicio || !this.fechaFin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Debe seleccionar una fecha inicial y una fecha final.',
      });

      return;
    }*/
    if (this.folio?.trim()) {
      const folio = this.folio.trim().toUpperCase();

      const regex = this.instancia === 'P' ? this.FOLIO_PRIMERA_REGEX : this.FOLIO_SEGUNDA_REGEX;

      if (!regex.test(folio)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Folio inválido',
          detail:
            this.instancia === 'P'
              ? 'Formato esperado: P-1234/2026'
              : 'Formato esperado: S-1234/2026',
        });

        return;
      }
    }
    //this.loadingMessage = 'Consultando información...';
    this.isLoading = true;

    const params = this.obtenerFiltros();

    this.apiService.buscarReporteEscritos(params).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.resultados = response.data;
          this.busquedaRealizada = true;
          this.irAResultados();
          this.messageService.add({
            severity: 'success',
            summary: 'Consulta realizada',
            detail: `${this.resultados.length} registros encontrados`,
          });

          console.log(this.resultados);
        } else {
          this.resultados = [];
          this.busquedaRealizada = true;

          this.messageService.add({
            severity: 'warn',
            summary: 'Sin resultados',
            detail: response.message,
          });
        }
      },

      error: (err) => {
        this.isLoading = false;
        console.error(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un problema al realizar la búsqueda.',
        });
      },
    });

    const filtros = {
      instancia: this.instancia,

      juzgado: this.juzgado,
      sala: this.sala,

      folio: this.folio,
      expediente: this.expediente,

      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,

      usuarioRecibio: this.usuarioRecibio,
    };

    console.log('Filtros enviados:', filtros);
  }
  private irAResultados(): void {
    setTimeout(() => {
      this.resultadosSection?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }
}


