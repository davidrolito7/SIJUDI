import { Component, Input, OnInit, signal } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { ListarExpedientesResponse } from '../../interfaces/juicioenlinea.model';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
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
import { PantallasService } from '../../services/pantallas.service';
@Component({
  selector: 'app-listar-expediente',
  imports: [CommonModule, FormsModule, DatePickerModule, Breadcrub, Spinner, ButtonModule, SelectModule, InputMaskModule, TableModule, IconFieldModule, InputIconModule, TagModule, InputTextModule],
  templateUrl: './listar-expediente.html',
  styleUrl: './listar-expediente.css',
})
export class ListarExpediente {
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
    private pantallasService: PantallasService

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
        queueMicrotask(() => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { ...params, page: currentPage },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        });
        return;
      }



      const requestParams = {
        page: currentPage,
        per_page: 5,
        ...(params['expediente'] && { expediente: params['expediente'] }),
        ...(params['fechaInicio'] && { fechaInicio: params['fechaInicio'] }),
        ...(params['fechaFinal'] && { fechaFinal: params['fechaFinal'] })
      };

      this.juicioService.getListadoExpedientes(requestParams).subscribe({
        next: (response) => {
          queueMicrotask(() => {
            this.expedientes.set(response.data);
            this.pagination = response.pagination;
          });
        },

        error: (error) => {
          console.error('Error:', error);
        }
      });
    });
  }

  getListarExpedientes(): void {
    const currentParams = this.route.snapshot.queryParams;
    const page = currentParams['page'] ? +currentParams['page'] : 1;

    const params: any = {
      page: page,
      per_page: 1

    };

    if (currentParams['expediente']) {
      params.expediente = currentParams['expediente'];
    }

    if (currentParams['fechaInicio'] && currentParams['fechaFinal']) {
      params.fechaInicio = currentParams['fechaInicio'];
      params.fechaFinal = currentParams['fechaFinal'];
    }

    this.juicioService.getListadoExpedientes(params).subscribe({
      next: (response) => {
        this.expedientes.set(response.data);
        this.pagination = response.pagination;
        console.log('Página actual:', page, 'Datos recibidos:', response.data.length);
      },
      error: (error) => {
        console.error('Error al obtener expedientes:', error);
      }
    });
  }

  aplicarFiltros(): void {
    const queryParams: any = {
      expediente: this.filtro.expediente || undefined,
      fechaInicio: undefined,
      fechaFinal: undefined,
      page: undefined // Resetear a página 1 (no visible en URL)
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

    // Cierra el dropdown si está abierto
    this.mostrarDropdown = false;
    const dropdown = document.getElementById('dropdownTimepicker');
    if (dropdown) {
      dropdown.classList.remove('show');
      dropdown.classList.add('hidden');
    }
  }

  limpiarFiltros(): void {
    this.filtro = {
      expediente: '',
      rangeDates: ''
    };
    this.getListarExpedientes();

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

    // Cierra el dropdown si está abierto
    this.mostrarDropdown = false;
    const dropdown = document.getElementById('dropdownTimepicker');
    if (dropdown) {
      dropdown.classList.remove('show');
      dropdown.classList.add('hidden');
    }
  }

  detalle(idExpediente: number): void {
    this.router.navigate(['/juicioenlinea/expedientes/detalle'], { state: { idExpediente } });
  }

  mostrarDropdown = false;
  etiquetaRangoSeleccionado = 'Esta semana';
  textoRango = '';




  cambiarPagina(page: number): void {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge',
      replaceUrl: true
    }).then(() => {
      console.log('URL actualizada a:', this.route.snapshot.queryParams);
    });
  }



  parseDateFromString(dateStr: string): Date {
    // dateStr debe ser 'yyyy-MM-dd'
    const [year, month, day] = dateStr.split('-').map(Number);
    // new Date(year, monthIndex, day) -- monthIndex inicia en 0
    return new Date(year, month - 1, day);
  }

  mostrarBoton(): boolean {

    return this.pantallasService.tienePermiso('requerimiento/crear');
  }
}
