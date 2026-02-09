import { Component, OnInit } from '@angular/core';
import { ListadoIniciosCreados } from '../../interfaces/juicioenlinea.model';
import { JuicioService } from '../../services/juicioenlinea.service';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Spinner } from "../../../shared/components/spinner/spinner";

@Component({
  selector: 'app-listar-demanda',
  imports: [
    CommonModule,
    RouterModule,
    DatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    RadioButtonModule,
    Spinner
],
    templateUrl: './listar-demanda.html',
  styleUrl: './listar-demanda.css',
})
export class ListarDemanda {

    inicios: ListadoIniciosCreados[] = [];
  visibleFirma: boolean = false;
  firmaForm!: FormGroup;
  isLoading: boolean = false;

  filtro: { folio: string; rangeDates: Date[] | ''; estado: number } = {
    folio: '',
    rangeDates: '',
    estado: 0, // 0 = default (sin enviar estado a la API)
  };

  pagination: { current_page: number; per_page: number; total: number; last_page: number } = {
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  };

  Math = Math;
  mostrarDropdown = false;

  constructor(
    private juicioService: JuicioService,
   // private flowbiteService: FlowbiteService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
   // initFlowbite();
   // this.flowbiteService.loadFlowbite(() => initFlowbite());

    this.route.queryParams.subscribe(params => {
      this.isLoading = true;

      // sincroniza UI (ngModel) desde URL (si no viene, default 0)
      const estadoStr = params['estado'];
      const estadoNum = estadoStr !== undefined && estadoStr !== null && estadoStr !== '' ? Number(estadoStr) : 0;
      this.filtro.estado = Number.isFinite(estadoNum) ? estadoNum : 0;

      this.filtro.folio = params['folio'] || '';

      if (params['fechaInicio'] && params['fechaFinal']) {
        this.filtro.rangeDates = [
          this.parseDateFromString(params['fechaInicio']),
          this.parseDateFromString(params['fechaFinal'])
        ];
      } else {
        this.filtro.rangeDates = '';
      }

      const currentPage = params['page'] ? +params['page'] : 1;
      if (!params['page'] || params['page'] !== currentPage.toString()) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { ...params, page: currentPage },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
        return;
      }

      // request params: incluir estado si es distinto de 0
      const requestParams: any = {
        page: currentPage,
        per_page: 5,
        ...(params['folio'] && { folio: params['folio'] }),
        ...(params['fechaInicio'] && { fechaInicio: params['fechaInicio'] }),
        ...(params['fechaFinal'] && { fechaFinal: params['fechaFinal'] }),
      };

      if (params['estado'] && params['estado'] !== '0') {
        requestParams.estado = params['estado'];
      }

      this.juicioService.getListadoInicios(requestParams).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.inicios = response?.data ?? [];
          this.pagination = response.pagination;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error:', error);
        }
      });
    });
  }

  aplicarFiltros(): void {
    const queryParams: any = {
      estado: this.filtro.estado === 0 ? null : this.filtro.estado,
      folio: this.filtro.folio ? this.filtro.folio : null,
      page: 1,
    };

    if (this.filtro.rangeDates?.length === 2) {
      queryParams.fechaInicio = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      queryParams.fechaFinal = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    } else {
      queryParams.fechaInicio = null;
      queryParams.fechaFinal = null;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });

    this.mostrarDropdown = false;
    const dropdown = document.getElementById('dropdownTimepicker');
    if (dropdown) {
      dropdown.classList.remove('show');
      dropdown.classList.add('hidden');
    }
  }

  limpiarFiltros(): void {
    this.filtro = {
      estado: 0,
      rangeDates: '',
      folio: ''
    };

    // limpia la url
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        estado: null,
        folio: null,
        fechaInicio: null,
        fechaFinal: null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });

    this.mostrarDropdown = false;
    const dropdown = document.getElementById('dropdownTimepicker');
    if (dropdown) {
      dropdown.classList.remove('show');
      dropdown.classList.add('hidden');
    }
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

  detalle(idInicio: number) {
    this.router.navigate(['/demandas/detalle'], { state: { idInicio } });
  }

  aplicarMascaraFolio(valor: string) {
    let limpio = valor.replace(/\D/g, '');
    limpio = limpio.slice(0, 8);
    if (limpio.length > 4) {
      limpio = limpio.slice(0, 4) + '/' + limpio.slice(4);
    }
    this.filtro.folio = limpio;
  }

  validarCaracteres(event: KeyboardEvent): void {
    const allowedKeys = ['Enter'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  showModalFirma() {
    this.router.navigate(['/demandas/crear']);
  }
}
