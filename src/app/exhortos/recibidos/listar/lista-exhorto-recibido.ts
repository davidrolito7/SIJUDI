import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MenuItem,MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router } from "@angular/router";
import { ToastModule } from 'primeng/toast';
import {GenericResponse} from '../../../shared/interface/shared.interface';
import { ListadoExhortosRecibidosI, UI_ParamlistadoExhortosRecibidosRequest,ListadoEstatus } from "../../interfaces/exhortos.model";
import {AuthService} from '../../../core/auth/service/auth.service';
import {ExhortosService} from '../../services/exhorto.service';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-ListaExhortosRecibidos',
   standalone: true,
  imports: [DatePicker, TableModule, InputTextModule, TagModule, SelectModule, ButtonModule, IconFieldModule, InputIconModule,
    BreadcrumbModule, AvatarModule, InputMaskModule, FloatLabelModule, ToastModule, CommonModule, FormsModule, Spinner, Breadcrub, TooltipModule],
  templateUrl: './lista-exhorto-recibido.html',
  styleUrl: './lista-exhorto-recibido.css',
  providers:[MessageService]
    
})
export class ListaExhortosRecibidos implements OnInit {


  isLoading: boolean = false;
  statuses: any[] = [];
  //loading: boolean = true;

  filter!: UI_ParamlistadoExhortosRecibidosRequest;
  response!: GenericResponse<ListadoExhortosRecibidosI[]>;
  listadosExhortos= signal<ListadoExhortosRecibidosI[]>([]);


  fechaInicio : Date | undefined;
  fechaFin : Date | undefined;
  fechaMaxima: Date| undefined;

  formSubmitted: boolean = false;
   // Fechas predeterminadas
   defaultDateIni: string | undefined;
   defaultDateFin: string | undefined;


  //@ViewChild('dt1') dt1: any;

 
  listadoEstatus: ListadoEstatus[] = [];
  //selectedEstatus : number=5; ///se ponme en 5 por que es el valor del estatus "recibidos"
  selectedEstatus : ListadoEstatus | undefined;


  constructor(
    private exhortoService: ExhortosService,
    public authService: AuthService,
    public router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { 

  }
  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  ngOnInit() {

    this.catalogoEstatus();
   
    //const today = new Date();

    //this.fechaMaxima = new Date(today);

    //this.fechaFin = new Date(today);
    //this.fechaInicio = new Date(today.setDate(today.getDate() - 300));

    //this.defaultDateIni = new Date(today.setDate(today.getDate() - 800)).toISOString().split('T')[0]; // Hace 400 días
    //this.defaultDateFin = new Date().toISOString().split('T')[0]; // Hoy

  }

  
  // Método para navegar al componente de detalle-notificacion
  verDetalleNotificacion(idExhortoRecibido: number) {
    //console.log('Naavegando a detalle-exhorto con idExhortoRecibido:', idExhortoRecibido);
    this.router.navigate(['/inicio/exhortos/detalle'], { state: { idExhortoRecibido } });

  }

  verAcuerdos(idExhortoRecibido: number) {
    //console.log('Naavegando a detalle-promocion con idPromocion:', idExhortoRecibido);
    this.router.navigate(['/inicio/exhortos/acuerdos'], { state: { idExhortoRecibido } });

  }

  async ListaExhortos(){
    await this.getListado();
  }

  getListado(): Promise<void>{
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

    
    const perfil = this.authService.getRoleNameUsuario(); // Obtener perfil del servicio
    const area = this.authService.getAreaUsuario();

    const obj = {
      fechaIni: fechaIni,
      fechaFin: fechaFin,
      perfil: perfil,
      estatus : this.selectedEstatus?.idEstatus,
      IdAreaAdminAplicaciones : area 
    };

    this.isLoading=true;
    this.cdr.detectChanges();

    this.exhortoService.getExhortosRecibidosListado(obj).subscribe({
      next: (res => {
        this.response = res as any;
        if (this.response.success) {
          //console.log("Respuesta del servidor:", this.response);
          this.listadosExhortos.set(this.response.data);

        } else {
          // Manejo de errores
          this.messageService.add({severity: 'error', summary: this.response.message, detail: this.response.errors[0]})
        }
        //this.loading = false;
      }),
      error: (err => {
        // Manejo de errores
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el listado de exhortos' });
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
    this.listadosExhortos.set([]);

    // Mostrar mensaje opcional
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros reiniciados',
      detail: 'Fechas y resultados han sido limpiados'
    });
  }

  onGlobalFilter(event: Event, dt: any) {
    const input = event.target as HTMLInputElement;
    dt.filterGlobal(input.value, 'contains');
  }
  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'unqualified':
        return 'danger';

      case 'proposal':
        return 'success';

      case 'new':
        return 'info';

      case 'negotiation':
        return 'warning';

      case 'qualified':
        return 'secondary'; // Devuelve undefined si no hay un valor de severidad definido

      default:
        return 'secondary'; // Manejar cualquier otro caso no previsto devolviendo undefined
    }
  }
  openPdf() {
    const pdfUrl = 'https://www.clickdimensions.com/links/TestPDFfile.pdf'; // Reemplaza esto con la URL de tu PDF
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
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
  
  async catalogoEstatus(){
    await this.getlistadoEstatus();
    
  }

  getlistadoEstatus(): Promise<void>{
    return new Promise((resolve,reject) =>{
        this.exhortoService.getListadoEstatus(1).subscribe({
          next: (response:any) => {
            if(response.success)
            {
              //console.log('Datos recibidos del catálogo:', response);
              this.listadoEstatus = response.data;
              this.selectedEstatus = this.listadoEstatus.find(f=>f.idEstatus=5);
               this.ListaExhortos();
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
  
   clear(table: Table) {
    // this.fechaInicial = undefined;
    // this.fechaFinal = undefined;
    table.clear();
  }
}
