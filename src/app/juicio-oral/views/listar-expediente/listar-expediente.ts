import { Component, signal } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { ListarExpedientesResponse } from '../../interfaces/juicioenlinea.model';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/service/auth.service';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PantallasService } from '../../services/pantallas.service';

@Component({
  selector: 'app-listar-expediente',
  imports: [CommonModule, FormsModule, DatePickerModule, Spinner, ButtonModule, SelectModule, InputMaskModule, TableModule, IconFieldModule, InputIconModule, TagModule, InputTextModule, ToastModule],
  templateUrl: './listar-expediente.html',
  styleUrl: './listar-expediente.css',
  providers: [MessageService]
})
export class ListarExpediente {
  isLoading = signal(false);
  filtro: { expediente: string; rangeDates: Date[] | '' } = {
    expediente: '',
    rangeDates: ''
  };

  expedientes = signal<ListarExpedientesResponse[]>([]);

  totalRecords = 0;
  rowsPerPage = 10;

  Math = Math;

  constructor(
    private juicioService: JuicioService,
    private router: Router,
    private route: ActivatedRoute,
    private au: AuthService,
    private pantallasService: PantallasService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
  }

  private sincronizarFiltrosDesdeURL(params: Record<string, string>): void {
    this.filtro.expediente = params['expediente'] || '';
    if (params['fechaInicio'] && params['fechaFinal']) {
      this.filtro.rangeDates = [
        this.parseDateFromString(params['fechaInicio']),
        this.parseDateFromString(params['fechaFinal'])
      ];
    } else {
      this.filtro.rangeDates = '';
    }
  }

  onLazyLoad(event: any): void {
    const rows = event.rows ?? this.rowsPerPage;
    const first = event.first ?? 0;

    this.rowsPerPage = rows;
    const page = Math.floor(first / rows) + 1;

    this.actualizarURL(page);
    this.cargarDatos(page, rows);
  }

  private cargarDatos(page: number, perPage: number): void {
    this.isLoading.set(true);

    const requestParams: any = {
      page: page,
      per_page: perPage,
    };

    if (this.filtro.expediente) requestParams['expediente'] = this.filtro.expediente;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.juicioService.getListadoExpedientes(requestParams).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.expedientes.set(response.data);
          this.totalRecords = response.pagination?.total ?? 0;
        } else {
          this.messageService.add({ severity: 'info', summary: 'Lo sentimos', detail: response.message });
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.messageService.add({ severity: 'info', summary: 'Lo sentimos', detail: error.error?.message || 'Error al conectar con el servidor' });
      }
    });
  }

  aplicarFiltros(): void {
    this.actualizarURL(1);
    this.cargarDatos(1, this.rowsPerPage);
  }

  private actualizarURL(page: number): void {
    const queryParams: any = {
      page,
      expediente: this.filtro.expediente || null,
      fechaInicio: null,
      fechaFinal: null
    };

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      queryParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      queryParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  limpiarFiltros(): void {
    this.filtro = {
      expediente: '',
      rangeDates: ''
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        expediente: null,
        fechaInicio: null,
        fechaFinal: null,
        page: null
      },
      queryParamsHandling: 'merge'
    });

    this.mostrarDropdown = false;
    this.cargarDatos(1, this.rowsPerPage);
  }

  detalle(idExpediente: number): void {
    this.router.navigate(['/juicioenlinea/expedientes/detalle'], { state: { idExpediente } });
  }

  cambiarPagina(page: number): void {
    // Ya no es necesario, lo maneja onLazyLoad
  }

  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  mostrarBoton(): boolean {
    return this.pantallasService.tienePermiso('requerimiento/crear');
  }

  mostrarDropdown = false;

  asExpediente(row: unknown): ListarExpedientesResponse {
    return row as ListarExpedientesResponse;
  }
}

