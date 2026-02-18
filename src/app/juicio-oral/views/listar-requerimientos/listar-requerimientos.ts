import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectModule } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { listarRequerimientos } from '../../../juicio-oral/interfaces/juicioenlinea.model';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { JuicioService } from '../../services/juicioenlinea.service';

@Component({
  selector: 'app-listar-requerimientos',
  imports: [CommonModule, Breadcrub, RadioButtonModule, TableModule, FormsModule, SelectModule, DatePicker, Button, TagModule],
  templateUrl: './listar-requerimientos.html',
  styleUrl: './listar-requerimientos.css',
  providers: [MessageService]
})
export class ListarRequerimientos implements OnInit {

  listaRequerimientos = signal<listarRequerimientos[]>([]);
  isLoading = false;

  // Opciones de estado para el select
  estadoOptions = [
    { label: 'Todo', value: 0 },
    { label: 'Pendiente', value: 1 },
    { label: 'Expirado', value: 2 },
    { label: 'Entregados', value: 3 },
    { label: 'Aceptado', value: 4 },
    { label: 'Rechazados', value: 5 }
  ];

  filtro: { rangeDates: Date[] | ''; estado: number } = {
    rangeDates: '',
    estado: 0,
  };

  pagination = {
    current_page: 1,
    per_page: 5,
    total: 0,
    last_page: 1
  };

  constructor(
    private juicioService: JuicioService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
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

    if (Array.isArray(this.filtro.rangeDates) && this.filtro.rangeDates.length === 2) {
      requestParams['fechaInicio'] = formatDate(this.filtro.rangeDates[0], 'yyyy-MM-dd', 'en-US');
      requestParams['fechaFinal'] = formatDate(this.filtro.rangeDates[1], 'yyyy-MM-dd', 'en-US');
    }

    if (this.filtro.estado > 0) requestParams['estado'] = this.filtro.estado;

    this.juicioService.getListarRequerimientosAbogados(requestParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.listaRequerimientos.set(response?.data ?? []);
        this.pagination = response.pagination;
        this.listaRequerimientos().forEach(r => this.actualizarTiempo(r));
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error:', error);
        this.cdr.markForCheck();
      }
    });
  }

  aplicarFiltros(): void {
    const queryParams: Record<string, string | number | null> = {
      page: 1,
      estado: this.filtro.estado > 0 ? this.filtro.estado : null,
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
    this.filtro = { estado: 0, rangeDates: '' };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado: null, fechaInicio: null, fechaFinal: null, page: 1 },
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

  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  detalleRequerimiento(idRequerimiento: number) {
    this.router.navigate(['/juicioenlinea/requerimientos/detalle'], { state: { idRequerimiento } });
  }

  actualizarTiempo(requerimiento: listarRequerimientos) {
    const fechaLimite = new Date(requerimiento.fechaLimite);
    const fechaActual = new Date();

    const diferenciaMs = fechaLimite.getTime() - fechaActual.getTime();

    if (diferenciaMs <= 0) {
      requerimiento.tiempoRestante = `Sin tiempo restante`;
      return;
    }

    const dias = Math.floor(diferenciaMs / (86400000));
    const horas = Math.floor((diferenciaMs % 86400000) / 3600000);
    const minutos = Math.floor((diferenciaMs % 3600000) / 60000);

    if (dias <= 0 && horas <= 0) {
      if (minutos === 1) {
        requerimiento.tiempoRestante = `Último minuto`;
      } else {
        requerimiento.tiempoRestante = `Últimos minutos: ${minutos} minutos`;
      }
    } else if (dias > 0) {
      const diasTexto = dias === 1 ? '1 día' : `${dias} días`;
      let horasTexto = '';
      if (horas > 0) {
        horasTexto = horas === 1 ? ', 1 hora' : `, ${horas} horas`;
      }
      requerimiento.tiempoRestante = `Tiempo restante: ${diasTexto}${horasTexto}`;
    } else {
      const horasTexto = horas === 1 ? '1 hora' : `${horas} horas`;
      const minutosTexto = minutos === 1 ? '1 minuto' : `${minutos} minutos`;
      requerimiento.tiempoRestante = `Último día: ${horasTexto} y ${minutosTexto}`;
    }
  }
  
   getEstadoId(requerimiento: any): number | null {
    // Busca el último historial y saca el idCatEstadoRequerimientos
    if (Array.isArray(requerimiento.historial) && requerimiento.historial.length > 0) {
      const ultimo = requerimiento.historial[requerimiento.historial.length - 1];
      const id = Number(ultimo.idCatEstadoRequerimientos);
      return isNaN(id) ? null : id;
    }
    return null;
  }
  
  getEstadoDescripcion(requerimiento: any): string | null {
    const id = this.getEstadoId(requerimiento);
    switch (id) {
      case 1: return 'Pendiente';
      case 2: return 'Expirado';
      case 3: return 'Entregado';
      case 4: return 'Aceptado';
      case 5: return 'Rechazado';
      default: return null;
    }
  }
  
  getEstadoTag(requerimiento: any): { severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary'; icon?: string } {
    const id = this.getEstadoId(requerimiento);
    switch (id) {
      case 1:
        return { severity: 'info', icon: 'pi pi-clock' }; // Pendiente
      case 2:
        return { severity: 'warn', icon: 'pi pi-exclamation-triangle' }; // Expirado
      case 3:
        return { severity: 'success', icon: 'pi pi-check' }; // Entregado
      case 4:
        return { severity: 'success', icon: 'pi pi-check-circle' }; // Aceptado
      case 5:
        return { severity: 'danger', icon: 'pi pi-times' }; // Rechazado
      default:
        return { severity: 'secondary', icon: 'pi pi-question' };
    }
  }
}
