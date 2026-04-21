import { Component, signal } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { ListarExpedientesResponse } from '../../interfaces/juicioenlinea.model';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/service/auth.service';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
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
  imports: [CommonModule, FormsModule, DatePickerModule, Breadcrub, Spinner, ButtonModule, SelectModule, InputMaskModule, TableModule, IconFieldModule, InputIconModule, TagModule, InputTextModule, ToastModule],
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

  pagination: { current_page: number; per_page: number; total: number; last_page: number } = {
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  };

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
    this.route.queryParams.subscribe(params => {
      const currentPage = params['page'] ? +params['page'] : 1;
      this.filtro.expediente = params['expediente'] || '';

      if (params['fechaInicio'] && params['fechaFinal']) {
        this.filtro.rangeDates = [
          this.parseDateFromString(params['fechaInicio']),
          this.parseDateFromString(params['fechaFinal'])
        ];
      } else {
        this.filtro.rangeDates = '';
      }

      if (!params['page'] || params['page'] !== currentPage.toString()) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { ...params, page: currentPage },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
        return; // no activar spinner aquí, el re-emit lo hará
      }

      // ← mover el spinner a AQUÍ, solo cuando sí vas a hacer la petición
      this.isLoading.set(true);

      const requestParams = {
        page: currentPage,
        per_page: 5,
        ...(params['expediente'] && { expediente: params['expediente'] }),
        ...(params['fechaInicio'] && { fechaInicio: params['fechaInicio'] }),
        ...(params['fechaFinal'] && { fechaFinal: params['fechaFinal'] })
      };

      this.juicioService.getListadoExpedientes(requestParams).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.expedientes.set(response.data);
          } else {
            this.messageService.add({
              severity: 'info',
              summary: 'Lo sentimos',
              detail: response.message
            });
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'info',
            summary: 'Lo sentimos',
            detail: error.error?.message || 'Error al conectar con el servidor'
          });
        }
      });
    });
  }

  aplicarFiltros(): void {
    const queryParams: any = {
      expediente: this.filtro.expediente || undefined,
      fechaInicio: undefined,
      fechaFinal: undefined,
      page: undefined
    };

    if (this.filtro.rangeDates?.length === 2) {
      queryParams.fechaInicio = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      queryParams.fechaFinal = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
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
  }

  detalle(idExpediente: number): void {
    this.router.navigate(['/juicioenlinea/expedientes/detalle'], { state: { idExpediente } });
  }

  cambiarPagina(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
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