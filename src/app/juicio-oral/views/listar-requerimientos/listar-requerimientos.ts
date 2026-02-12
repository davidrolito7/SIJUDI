import { Component,OnInit } from '@angular/core';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectModule  } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { listarRequerimientos } from '../../../juicio-oral/interfaces/juicioenlinea.model';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { JuicioService } from '../../services/juicioenlinea.service';



interface ListadoEstatus {
    idEstatus: string;
    descripcion: string;
}

@Component({
  selector: 'app-listar-requerimientos',
  imports: [CommonModule,Breadcrub,RadioButtonModule,TableModule,FormsModule,SelectModule,DatePicker,Button,TagModule],
  templateUrl: './listar-requerimientos.html',
  styleUrl: './listar-requerimientos.css',
   providers: [MessageService]
})

export class ListarRequerimientos implements OnInit {
  

   requerimientosTotales: listarRequerimientos[] = [];
  fechaInicio : Date | undefined;
  fechaFin : Date | undefined;
  filtro: { folio: string; rangeDates: Date[] | ''; estado: number } = {
    folio: '',
    rangeDates: '',
    estado: 0,
  };
    pagination: { current_page: number; per_page: number; total: number; last_page: number } = {
    current_page: 1,
    per_page: 5,
    total: 0,
    last_page: 1
  };

  listadoEstatus: ListadoEstatus[] = [{"idEstatus":"0","descripcion":"Todo"},{"idEstatus":"1","descripcion":"Pendiente"},
    {"idEstatus":"2","descripcion":"Expirado"},
    {"idEstatus":"3","descripcion":"Entregados"},{"idEstatus":"4","descripcion":"Aceptado"},
    {"idEstatus":"5","descripcion":"Rechazados"}  ];

    selectedEstatus : ListadoEstatus | undefined;

trackByRequerimientoId(index: number, requerimiento: listarRequerimientos): number {
    return requerimiento.idRequerimiento; // o el identificador único
  }
constructor(
  private juicioService: JuicioService,
  private messageService: MessageService,
  private router: Router,
  private route: ActivatedRoute,
){
  
}
   

    ngOnInit() {
  

    this.route.queryParams.subscribe(params => {
      this.filtro.estado = params['estado'] || '';

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
        per_page: 5,
        ...(params['estado'] && { estado: params['estado'] }),
        ...(params['fechaInicio'] && { fechaInicio: params['fechaInicio'] }),
        ...(params['fechaFinal'] && { fechaFinal: params['fechaFinal'] })
      };

      this.juicioService.getListarRequerimientosAbogados(requestParams).subscribe({
        next: (response) => {
          console.table(response.data);
          this.requerimientosTotales = response.data;
          this.pagination = response.pagination;
          this.requerimientosTotales.forEach(r => this.actualizarTiempo(r));
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
    });
  }

  detalleRequerimiento(idRequerimiento: number) {
    console.log('Ir al requerimiento numero: ', idRequerimiento);
    this.router.navigate(['/requerimiento/asignaciones/detalle'], { state: { idRequerimiento } });
   
  }
      


    aplicarFiltros(){}

    clearFecha() {

    this.fechaInicio = undefined;
    this.fechaFin = undefined;

    // Limpiar resultados visibles
    // this.listadosSignal.set([]);

    // Mostrar mensaje opcional
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros reiniciados',
      detail: 'Fechas y resultados han sido limpiados'
    });

  }


 
  parseDateFromString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }


  getTagConfig(estatus: any): { icon: string; severity: 'success' | 'warn' | 'info' | 'secondary',nombre:string } {
    console.log("eeee",estatus);

    const historial = estatus?.historial;
    if (!historial || historial.length === 0) {
      return {icon: 'pi pi-check', severity: 'info', nombre:'Sin historial' };
    }
    switch (estatus) {
      case '1':
        return { icon: 'pi pi-check', severity: 'info', nombre:'Pendiente' };
      case '2':
        return { icon: 'pi pi-exclamation-triangle', severity: 'warn', nombre:'Expirado'  };
      case '3':
        return { icon: 'pi pi-send', severity: 'success' , nombre:'Entregado' };
        case '4':
        return { icon: 'pi pi-send', severity: 'info' , nombre:'Aceptado' };
        case '5':
        return { icon: 'pi pi-send', severity: 'warn' , nombre:'Rechazado' };
      default:
        return { icon: 'pi pi-exclamation-triangle', severity: 'warn' , nombre:'Sin historial' };
    }
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

 
}
