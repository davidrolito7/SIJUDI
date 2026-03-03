import { Component, ChangeDetectorRef, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Button } from "primeng/button";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { DatePicker } from "primeng/datepicker";
import { SelectModule  } from "primeng/select";
import { Avatar } from "primeng/avatar";
import { Breadcrumb } from "primeng/breadcrumb";
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { ListadoEstatus, ListadoExhortosEnviados } from '../../interfaces/exhortos.model';
import { ExhortosService } from '../../services/exhorto.service';
import { AuthService } from '../../../core/auth/service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from "primeng/toast";
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-ListaExhortosEnviados',
  imports: [Button, TableModule, IconField, InputIcon, DatePicker, SelectModule,
    ToastModule, CardModule, PaginatorModule, FormsModule, CommonModule, InputTextModule, Spinner, Breadcrub, TagModule, TooltipModule],
  templateUrl: './lista-exhorto-Enviado.html',
  styleUrl: './lista-exhorto-Enviado.css',
  providers: [MessageService]
})
export class ListaExhortosEnviados implements OnInit {
 //response!: GenericResponse<ListadoExhortosEnviados[]>;
 

  isLoading: boolean = false;
  listados: any[] = [];
 
  listadosSignal = signal<ListadoExhortosEnviados[]>([]);


  fechaInicio : Date | undefined;
  fechaFin : Date | undefined;
  fechaMaxima: Date| undefined;

  formSubmitted: boolean = false;

  date3: Date | undefined;
  date4: Date | undefined;
  private defaultDate3: Date | undefined;
  private defaultDate4: Date | undefined;
  listadoEstatus: ListadoEstatus[] = [];
  selectedEstatus : ListadoEstatus | undefined;
  //idarea = this.authService.idarea;

  constructor(
    private exhortoService: ExhortosService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {

  }
  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  ngOnInit() {
    // this.loading = false;
    this.catalogoEstatus();
    const today = new Date();

    //this.fechaMaxima = new Date(today);

    //this.fechaFin = new Date(today);
    //this.fechaInicio = new Date(today.setDate(today.getDate() - 300));

    // Intentar cargar las fechas desde localStorage
    /*const storedDate1 = localStorage.getItem('date1');
    const storedDate2 = localStorage.getItem('date2');
    if (storedDate1 && storedDate2) {
      // Si existen fechas en localStorage, parsearlas y asignarlas
      this.date3 = new Date(storedDate1);
      this.date4 = new Date(storedDate2);
    } else {
      // Configurar las fechas predeterminadas pero no asignarlas a date1 y date2 aún
      this.fechaFin = new Date(today);
      this.fechaInicio = new Date(today.setDate(today.getDate() - 300));

    }*/
  }

  onGlobalFilter(event: Event, dt: any) {
    const input = event.target as HTMLInputElement;
    dt.filterGlobal(input.value, 'contains');
  }

 
   // Método para navegar al componente de detalle-exhortos-recibidos
   verDetalleEnviado(idExhortoEnviado: number) {
    //console.log('Naavegando a detalle-exhorto-enviado con idExhortoEnviado:', idExhortoEnviado);
    this.router.navigate(['/exhortos/detalles-exhorto-enviado'], { state: { idExhortoEnviado } });

  }
  CrearExhorto(){
    //console.log("Navengando hacia generar respuesta", "");
    this.router.navigate(['/inicio/exhortos/detalle/generar-respuesta'], { state: {  } });

}

  async ListaExhortosEnviados(){
    await this.getListaExhortosEnviados();
  }
  getListaExhortosEnviados(): Promise<void>{
    return new Promise((resolve,reject) =>{
    this.formSubmitted = true;
     // Utilizar fechas predeterminadas si date1 o date2 no están definidas
    let fechaIni = this.fechaInicio;
    let fechaFin = this.fechaFin;
    [fechaIni, fechaFin] = [this.fechaInicio, this.fechaFin];

    if(fechaIni===null){

      fechaIni=undefined;
    }
    if(fechaFin===null){
      fechaFin=undefined;
    }

    /*
     // Guardar las fechas seleccionadas en localStorage si ambas fechas han sido proporcionadas por el usuario
     if (!fechaIni || !fechaFin) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fechas requeridas',
        detail: 'Debes seleccionar un rango de fechas para la búsqueda.'
      });
      return;
    }

    fechaIni = new Date(fechaIni.setHours(0, 0, 0, 0));
    fechaFin = new Date(fechaFin.setHours(23, 59, 59, 999));
*/
    //localStorage.setItem('dateE3', fechaIni.toISOString());
    //localStorage.setItem('dateE4', fechaFin.toISOString());
    // Realizar la búsqueda
    const perfil = this.authService.getRoleNameUsuario(); // Obtener perfil del servicio
   const area = this.authService.getAreaUsuario();

    const obj = {
      fechaIni: fechaIni,
      fechaFin: fechaFin,
      perfil: perfil,
      estatus : this.selectedEstatus?.idEstatus ?? 0,
      IdAreaAdminAplicaciones : area
    };

     this.isLoading=true;
     this.cdr.detectChanges();

    this.exhortoService.getExhortosEnviados(obj).subscribe({
      next: (response => {
        //this.response = res as any;
        if (response.success) {
          //console.log("Respuesta del servidor:", this.response);
          this.listadosSignal.set(response.data as any);

        }else
            {
              this.messageService.add({severity: 'error', summary: response.message, detail: response.errors[0]})
            }
        
      }),
      error: (err => {
        // Manejo de errores
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
        this.isLoading=false;
        this.cdr.detectChanges();
      }),
      complete:()=>{
        this.isLoading=false;
        this.cdr.detectChanges();
      }
    });
});

  }

  esRangoInvalido(): boolean {
    /*return this.formSubmitted && (
      !this.rangoFechas ||
      this.rangoFechas.length !== 2 ||
      !this.rangoFechas[0] ||
      !this.rangoFechas[1]
    );*/

    return this.formSubmitted && (
      !this.fechaInicio ||
      !this.fechaFin ||
      this.fechaInicio > this.fechaFin
    );
  }

  resetFilter() {
    // Limpiar fechas
    //localStorage.removeItem('dateE3');
    //localStorage.removeItem('dateE4');

    this.fechaInicio = undefined;
    this.fechaFin = undefined;

    // Limpiar resultados visibles
    this.listadosSignal.set([]);
 
    // Mostrar mensaje opcional
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros reiniciados',
      detail: 'Fechas y resultados han sido limpiados'
    });
  }


  NuevoExhorto(){
    this.router.navigate(['/inicio/exhortos/crear-exhorto']);
  }

 
  getTagConfig(estatus: string): { icon: string; severity: 'success' | 'warn' | 'info' | 'secondary' } {
    switch (estatus) {
      case 'Respondido':
        return { icon: 'pi pi-check', severity: 'success' };
      case 'Pendiente de enviar':
        return { icon: 'pi pi-exclamation-triangle', severity: 'warn' };
      case 'Enviado':
        return { icon: 'pi pi-send', severity: 'success' };
      default:
        return { icon: 'pi pi-info-circle', severity: 'info' };
    }
  }
  async catalogoEstatus(){
    await this.getlistadoEstatus();
    
  }
  getlistadoEstatus(): Promise<void>{
    return new Promise((resolve,reject) =>{
        this.exhortoService.getListadoEstatus(2).subscribe({
          next: (response:any) => {
            if(response.success)
            {
              //console.log('Datos recibidos del catálogo:', response);
              this.listadoEstatus = response.data;
              this.selectedEstatus = this.listadoEstatus.find(f=>f.idEstatus==2);
              this.ListaExhortosEnviados();
              //console.log(this.listadoEstatus);
            }
            else
            {
              this.messageService.add({severity: 'error', summary: response.message, detail:response.errors})
            }
          },
          error:(e)=>
          {
            //console.error('Error al cargar el catálogo de Materia', e);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
          },
        });
    });
  }
  clearFecha() {

    this.fechaInicio = undefined;
    this.fechaFin = undefined;

    // Limpiar resultados visibles
    this.listadosSignal.set([]);

    // Mostrar mensaje opcional
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros reiniciados',
      detail: 'Fechas y resultados han sido limpiados'
    });

  }
   clear(table: Table) {
    // this.fechaInicial = undefined;
    // this.fechaFinal = undefined;
    table.clear();
    
  }

}

