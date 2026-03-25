import { ChangeDetectorRef, Component, signal, } from '@angular/core';
import { Select } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { Button } from "primeng/button";
import { Table, TableModule } from "primeng/table";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { Tag } from "primeng/tag";
import { Toast } from "primeng/toast";
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {InputTextModule} from 'primeng/inputtext';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { catalogoEstatus, ListadoAmparosRecibidosI } from '../../interfaces/amparos.models';
import { AuthService } from '../../../core/auth/service/auth.service';
import { AmparosService } from '../../services/amparo.service';

@Component({
  selector: 'app-ListarAmparosRecibidos',
  imports: [Spinner, Breadcrub, Select, DatePicker, Button, TableModule, IconField, InputIcon, Tag, Toast,CommonModule,FormsModule,InputTextModule],
  templateUrl: './listar-amparos-recibidos.html',
  styleUrl: './listar-amparos-recibidos.css',
  providers: [MessageService]
})
export class ListarAmparosRecibidos {
  isLoading: boolean = false;
  fechaInicio : Date | undefined;
  fechaFin : Date | undefined;
  fechaMaxima: Date| undefined;

  //listadosExhortos= signal<any[]>([]);
  listaAmparos = signal<ListadoAmparosRecibidosI[]>([])
  tienePermisoVerAcuerdo = signal<boolean>(false);
  listaEstatus = signal<catalogoEstatus[]>([]);


  selectedEstatus: catalogoEstatus | undefined;

  constructor(
    private amparosService: AmparosService,
    public authService: AuthService,
    public router: Router,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getEstatus();
  }
  clearFecha() {

    this.fechaInicio = undefined;
    this.fechaFin = undefined;

    // Limpiar resultados visibles
    this.listaAmparos.set([]);

    // Mostrar mensaje opcional
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros reiniciados',
      detail: 'Fechas y resultados han sido limpiados'
    });

  }
  //listadosExhortos(){}
  clear(table: Table) {
    // this.fechaInicial = undefined;
    // this.fechaFinal = undefined;
    table.clear();
  }
  getTagConfig(estatus: string): { icon: string; severity: 'success' | 'warn' | 'info' | 'secondary' | 'danger' | 'contrast' } {
    switch (estatus) {
      case 'Respondido':
        return { icon: 'pi pi-reply', severity: 'info' };          // Azul - respondido
      case 'Acordado':
        return { icon: 'pi pi-check-circle', severity: 'success' };// Verde - completado
      case 'Recibido':
        return { icon: 'pi pi-inbox', severity: 'contrast' };      // Oscuro - recibido (marcado/registrado)
      case 'Pendiente de recibir':
        return { icon: 'pi pi-clock', severity: 'warn' };          // Naranja - pendiente
      case 'En proceso de diligencia':
        return { icon: 'pi pi-spinner', severity: 'secondary' };   // Gris - en curso
      default:
        return { icon: 'pi pi-question-circle', severity: 'secondary' };
    }
  }
  verAcuerdos(idNotificacion: number) {
    //console.log('Naavegando a detalle-promocion con idPromocion:', idExhortoRecibido);
    this.router.navigate(['/exhortos/respuesta-exhorto-recibido'], { state: { idNotificacion } });

  }
   // Método para navegar al componente de detalle-notificacion
  verDetalleNotificacion(idNotificacion: number) {
    //console.log('Naavegando a detalle-exhorto con idExhortoRecibido:', idExhortoRecibido);
    this.router.navigate(['/amparos/detalles-amparo-recibido'], { state: { idNotificacion } });

  }
  //Metodo para la llamda al servicio de amparos recibidoListada que se le pasa al ngOnInit 
  getListado() {
    //console.log('rangoFechas:', this.rangoFechas);
    let fechaIni = this.fechaInicio;
    let fechaFin = this.fechaFin;
    [fechaIni, fechaFin] = [this.fechaInicio, this.fechaFin];

    /*if (!fechaIni || !fechaFin) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fechas requeridas',
        detail: 'Debes seleccionar un rango de fechas para la búsqueda.'
      });
      return;
    }*/
   if(fechaIni===null){

      fechaIni=undefined;
    }
    if(fechaFin===null){
      fechaFin=undefined;
    }
  
    const perfil = this.authService.getRoleNameUsuario();

    //fechaIni = new Date(fechaIni.setHours(0, 0, 0, 0));
    //fechaFin = new Date(fechaFin.setHours(23, 59, 59, 999));

    //localStorage.setItem('dateE3', fechaIni.toISOString());
    //localStorage.setItem('dateE4', fechaFin.toISOString());
    const idArea = this.authService.getAreaUsuario()

    const obj = {
      fechaIni: fechaIni,
      fechaFin: fechaFin,
      estatus: this.selectedEstatus?.idEstatus || 0,
      perfil: perfil,
      idAreaAdminAplicaciones: Number(idArea)
    };
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getAmparosRecibidosListado(obj)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.listaAmparos.set(response.data);
          } else {
            this.messageService.add({severity: 'error', summary: response.message, detail: response.errors[0]})
          }
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el listado de amparos recibidos' });
          this.isLoading = false;
          this.cd.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
  }
  getEstatus(){
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoEstatus().subscribe({
      next: (response) => {
        if (response.success) {
          this.listaEstatus.set(response.data);
          this.selectedEstatus = this.listaEstatus().find(f=>f.idEstatus=1);
          this.getListado();
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de estatus' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
      }
    });
  }
}