import { Component, OnInit } from '@angular/core';
import { AudienciasResponse } from '../../interfaces/juicioenlinea.model';
//import { FlowbiteService } from '../../services/flowbite.service';
import { JuicioService } from '../../services/juicioenlinea.service';
//import { initFlowbite } from 'flowbite';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common'; // Asegúrate de importar esto
import { Spinner } from "../../../shared/components/spinner/spinner";
 
import { ListadoIniciosCreados } from '../../interfaces/juicioenlinea.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';


@Component({
  selector: 'app-listar-audiencias',
 imports: [
      CommonModule,
  
    DatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    RadioButtonModule,
    Spinner
 ],
  templateUrl: './listar-audiencias.html',
  styleUrl: './listar-audiencias.css',
})
export class ListarAudiencias implements OnInit {
  audiencias: AudienciasResponse[] = [];
  isLoading: boolean = false;

  filtro: { folio: string; rangeDates: Date[] | '', estado: string } = {
    folio: '',
    rangeDates: '',
    estado: '',
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
  //  private flowbiteService: FlowbiteService,
    private juicioService: JuicioService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
 //   initFlowbite();
 //   this.flowbiteService.loadFlowbite(() => initFlowbite());

    this.route.queryParams.subscribe(params => {
      this.filtro.estado = params['estado']|| '';
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

      const requestParams = {
        page: currentPage,
        per_page: 2,
        ...(params['estado'] && { estado: params['estado'] }),
        ...(params['fechaInicio'] && { fechaInicio: params['fechaInicio'] }),
        ...(params['fechaFinal'] && { fechaFinal: params['fechaFinal'] }),
        ...(params['folio'] && { folio: params['folio'] })
      };

      this.juicioService.getAudiencias(requestParams).subscribe({
        next: (response) => {
          this.audiencias = response.data;
          this.pagination = response.pagination;

        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
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


  detalle(idAudiencia: number): void {
    this.router.navigate(['/audiencias/detalle'], { state: { idAudiencia } });
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
    const queryParams: any = {
      folio: this.filtro.folio || undefined,
      estado: null,
      fechaInicio: undefined,
      fechaFinal: undefined,
      page: 1 // Resetear a página 1
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
      estado: '',
      rangeDates: '',
      folio: ''
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        estado: null,
        folio: null,
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

  mostrarDropdown = false;
  etiquetaRangoSeleccionado = 'Esta semana';
  textoRango = '';

  seleccionarRango(rango: 'Hoy' | 'Ayer' | '7' | '30' | '90'): void {
    const hoy = new Date();
    let inicio: Date;
    let fin: Date = new Date(hoy);

    switch (rango) {
      case 'Hoy':
        inicio = new Date(hoy);
        this.etiquetaRangoSeleccionado = 'Hoy';
        break;
      case 'Ayer':
        inicio = new Date(hoy);
        inicio.setDate(inicio.getDate() - 1);
        fin = new Date(inicio);
        this.etiquetaRangoSeleccionado = 'Ayer';
        break;
      case '7':
        // Semana actual: desde el lunes hasta hoy o domingo
        const day = hoy.getDay(); // 0=domingo, 1=lunes,...
        const diffToMonday = day === 0 ? 6 : day - 1;
        inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - diffToMonday);
        this.etiquetaRangoSeleccionado = 'Esta semana';
        break;
      case '30':
        inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - 29);
        this.etiquetaRangoSeleccionado = 'Ultimos 30 días';
        break;
      case '90':
        inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - 89);
        this.etiquetaRangoSeleccionado = 'Ultimos 90 días';
        break;
      default:
        inicio = new Date(hoy);
        this.etiquetaRangoSeleccionado = 'Esta semana';
    }


    const fInicio = inicio.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const fFin = fin.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    this.textoRango = `${fInicio} - ${fFin}`;

    this.filtro.rangeDates = [inicio, fin];

    this.aplicarFiltros();
                // Cierra el dropdown si está abierto
    this.mostrarDropdown = false;
    const dropdown = document.getElementById('transactions-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
      dropdown.classList.add('hidden');
    }
  }
  aplicarMascaraFolio(valor: string) {
    let limpio = valor.replace(/\D/g, '');
    limpio = limpio.slice(0, 8);
    if (limpio.length > 4) {
      limpio = limpio.slice(0, 4) + '/' + limpio.slice(4);
    }
    this.filtro.folio = limpio;
  }

}