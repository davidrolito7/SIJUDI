import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AudienciasResponse } from '../../interfaces/juicioenlinea.model';
//import { FlowbiteService } from '../../services/flowbite.service';
import { JuicioService } from '../../services/juicioenlinea.service';
//import { initFlowbite } from 'flowbite';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common'; // Asegúrate de importar esto
import { Spinner } from "../../../shared/components/spinner/spinner";

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Breadcrub } from '../../../shared/components/breadcrub/breadcrub';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-listar-audiencias',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    // PrimeNG
    DatePickerModule,
    DialogModule,
    ButtonModule,
    ToastModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TableModule,
    SelectModule,
    InputTextModule,
    InputMaskModule,
    TooltipModule,

    // Shared components
    Breadcrub,
    Spinner
  ],
  templateUrl: './listar-audiencias.html',
  styleUrl: './listar-audiencias.css',
  providers: [MessageService],
})
export class ListarAudiencias implements OnInit {
  audiencias: AudienciasResponse[] = [];
  isLoading: boolean = false;

  filtro: { folio: string; rangeDates: Date[] | '', estado: number } = {
    folio: '',
    rangeDates: '',
    estado: 0,
  };

  //Paginacion
  pagination: { current_page: number; per_page: number; total: number; last_page: number } = {
    current_page: 1,
    last_page: 1,
    per_page: 2,
    total: 0,
  };

  Math = Math;

  constructor(

    private juicioService: JuicioService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.sincronizarFiltrosDesdeURL(params);
    const page = params['page'] ? +params['page'] : 1;
    this.cargarDatos(page);
  }

  private sincronizarFiltrosDesdeURL(params: Record<string, string>): void {
    const estadoNum = params['estado'] ? Number(params['estado']) : 0;
    this.filtro.estado = Number.isFinite(estadoNum) ? estadoNum : 0;
    this.filtro.folio = params['folio'] || '';
    this.filtro.rangeDates =
      params['fechaInicio'] && params['fechaFinal']
        ? [
          this.parseDateFromString(params['fechaInicio']),
          this.parseDateFromString(params['fechaFinal']),
        ]
        : '';
  }
  private cargarDatos(page: number): void {
    this.isLoading = true;

    const requestParams: Record<string, string | number> = {
      page,
      per_page: 5,
    };

    if (this.filtro.folio) requestParams['folio'] = this.filtro.folio;

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    if (this.filtro.estado > 0) requestParams['estado'] = this.filtro.estado;

    this.juicioService.getAudiencias(requestParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.audiencias = response?.data ?? [];
        this.pagination = response.pagination;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error:', error);
        this.cdr.markForCheck();
      },
    });
  }



  getListarAudiencias(): void {

    const currentParams = this.route.snapshot.queryParams;
    const page = currentParams['page'] ? +currentParams['page'] : 1;

    const params: any = {
      page: page,
      per_page: 2

    };

    // Obtener el estado desde el radiobutton seleccionado si existe
    const checkedRadio = document.querySelector<HTMLInputElement>('input[name="filtro"]:checked');
    if (checkedRadio) {
      params.estado = checkedRadio.value;
    } else if (currentParams['estado']) {
      params.estado = currentParams['estado'];
    }

    if (currentParams['folio']) {
      params.folio = currentParams['folio'];
    }

    if (currentParams['fechaInicio'] && currentParams['fechaFinal']) {
      params.fechaInicio = currentParams['fechaInicio'];
      params.fechaFinal = currentParams['fechaFinal'];
    }

    this.juicioService.getAudiencias(params).subscribe(

      (response) => {
        this.isLoading = false;
        this.audiencias = response?.data ?? [];
        this.pagination = response.pagination;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error al obtener el listado de requerimiento', error);
      }
    );
  }


  detalle(idAudiencia: number) {
    this.router.navigate(['/juicioenlinea/audiencias/detalle'], { state: { idAudiencia } });
  }

  isEnProgreso(start: string | Date, end: string | Date): boolean {
    const now = new Date();
    const inicio = new Date(start);
    const fin = new Date(end);
    return now >= inicio && now <= fin;
  }

  limpiarEspaciosFolio(valor: string) {
    this.filtro.folio = valor.replace(/\s+/g, '');
  }

  validarCaracteres(event: KeyboardEvent): void {
    const char = event.key;
    const regex = /^[\d/]$/; // Solo permite números y el carácter '/'
    if (!regex.test(char)) {
      event.preventDefault(); // Bloquea el carácter si no es válido
    }
  }

  parseDateFromString(dateStr: string): Date {
    // dateStr debe ser 'yyyy-MM-dd'
    const [year, month, day] = dateStr.split('-').map(Number);
    // new Date(year, monthIndex, day) -- monthIndex inicia en 0
    return new Date(year, month - 1, day);
  }


  aplicarFiltros(): void {
    const queryParams: Record<string, string | number | null> = {
      page: 1,
      estado: this.filtro.estado > 0 ? this.filtro.estado : null,
      folio: this.filtro.folio || null,
      fechaInicio: null,
      fechaFinal: null,
    };

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      queryParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      queryParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });

    this.cargarDatos(1);
  }




  limpiarFiltros(): void {
    this.filtro = { estado: 0, rangeDates: '', folio: '' };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado: null, folio: null, fechaInicio: null, fechaFinal: null, page: 1 },
      queryParamsHandling: 'merge',
    });

    this.cargarDatos(1);
  }

  cambiarPagina(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    this.cargarDatos(page);
  }

  estadoOptions = [
    { label: 'Todo', value: 0 },
    { label: 'Programadas', value: 1 },
    { label: 'Finalizadas', value: 2 },
    { label: 'Canceladas', value: 3 },
  ];
  getEstadoDescripcion(audiencia: unknown): string | null {
    const i = audiencia as {
      ultimo_estado?: { descripcion?: string };
    };

    return i.ultimo_estado?.descripcion ?? null;
  }

  getEstadoId(audiencia: unknown): number | null {
    const i = audiencia as {
      ultimo_estado?: { idCatalogoEstadoAudiencia?: string | number };
    };

    return i.ultimo_estado?.idCatalogoEstadoAudiencia
      ? Number(i.ultimo_estado.idCatalogoEstadoAudiencia)
      : null;
  }


  getEstadoTag(audiencia: unknown): { severity: 'success' | 'info' | 'warn' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(audiencia);
    switch (id) {
      case 1:
        return { severity: 'success', icon: 'pi pi-check' };
      case 2:
        return { severity: 'info', icon: 'pi pi-clock' };
      case 3:
        return { severity: 'warn', icon: 'pi pi-exclamation-triangle' };
      case 4:
        return { severity: 'secondary', icon: 'pi pi-exclamation-triangle' };
      default:
        return { severity: 'secondary' };
    }
  }

}