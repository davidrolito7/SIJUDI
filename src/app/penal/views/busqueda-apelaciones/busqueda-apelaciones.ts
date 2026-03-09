
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Table,TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { OverlayModule } from 'primeng/overlay';
import { AccordionModule  } from 'primeng/accordion';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { DatePickerModule } from 'primeng/datepicker';
import { SplitterModule } from 'primeng/splitter';
import { CatApelaciones, CatSalas, Nomenclatura } from '../../interface/salas.interface';
import { SalasService } from '../../service/salas.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { busquedaExpediente, DTABusqueda, responseDataBusqueda } from '../../interface/salas.interface';
import { InputMaskModule } from 'primeng/inputmask';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import {AuthService} from '../../../core/auth/service/auth.service';

@Component({
  selector: 'app-busqueda-apelaciones',
      standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    TableModule,
    PanelModule,
    FieldsetModule,
    Select,
    ButtonModule,
    InputTextModule,
    AccordionModule,
    DrawerModule,
    DatePickerModule,
    SplitterModule,
    InputMaskModule,
    IconFieldModule,
    InputIconModule,
    Breadcrub,
Spinner ,
  ],
  templateUrl: './busqueda-apelaciones.html',
  styleUrl: './busqueda-apelaciones.css',
  providers: [MessageService],
})
export class BusquedaApelaciones implements OnInit  {

  isLoading:boolean=false;

  catApelaciones: CatApelaciones[] = [];

  catNomenclatura: Nomenclatura [] = [];
  
  catSalas: CatSalas[] = [];
  activeIndex: string | null = null; 
  
  


  resultados: any[] = [];

  filtros = {
    "IdGeneral": 3315,
      "IdPantalla": 1,
    FolioOficialia: '' as string | null,
    IdSala: null as string | number | null,
    IdNomenclatura: null as string | number | null,
    FolioExpediente: '',
    TipoApelacion: null as string | null,
    ExpedienteCausa: '',
    NombreParte: '',
    FechaRecepInicial: null,
    FechaRecepFinal: null,
  };


  salas = [
    { id: 1, nombre: 'Primera Sala' },
    { id: 2, nombre: 'Segunda Sala' },
  ];

  apelaciones=[];
 listaapelaciones :  responseDataBusqueda | null = null;

  lstapelaciones = signal<busquedaExpediente[]>([]);

//   busqueda  = signal<DTABusqueda>({idGeneral: 3315,
//     idPantalla: 1,
    
// idSala: "",
//     tipoApelacion: "",
//     folioOficialia: "0837/2023",
//     idNomenclatura: "",
// folioExpediente: "",
// expedienteCausa: "",
// fechaRecepInicial: "",
// fechaRecepFinal: "",
// nombreParte: ""
//   });
selected: any;

        date2: Date | undefined;
    
ngOnInit(): void {
  //  this.cargarApelaciones();
    this.cargarNomenclatura();
  //  this.cargarSalas();
  this.cargarCatalogoSalas();
    this.cargarCatalogo();
    this.cargarDatos();
    this.activeIndex = (0).toString(); // Establece el primer panel como activo
  }

   constructor(
    private salasService: SalasService,
    public authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }


  buscar() {
    console.log('Filtros:', this.filtros);
    // aquí llamas tu API
  }

  limpiar() {
    this.filtros = {
      "IdGeneral": 3315,
      "IdPantalla": 1,
      FolioOficialia: '',
      IdSala: null,
      IdNomenclatura: null,
      FolioExpediente: '',
      TipoApelacion: null,
      ExpedienteCausa: '',
      NombreParte: '',
      FechaRecepInicial: null,
      FechaRecepFinal: null,
    };
  }
  



clear(table: Table) {
    // this.fechaInicial = undefined;
    // this.fechaFinal = undefined;
    table.clear();
  }

  cargarApelaciones() {
  this.salasService.getCatApelaciones(1, 1, 1).subscribe({
      next: (resp) => {
          this.catApelaciones= resp.data;
          this.cdr.detectChanges(); // 👈 fuerza sincronización 
      },
      error: (error) => {
        console.error('Error al cargar apelaciones', error);
      }
    });
}

cargarCatalogo() {
  this.salasService.getCatalogoApelaciones()
    .subscribe({
      next: (resp) => {
        this.catApelaciones = resp.data;
        
        this.cdr.detectChanges(); // 👈 fuerza sincronización 
      },
      error: (err) => {
        console.error(err);
      }
    });
}

// this.selectedSala = this.salas.find(s => s.idsala === 2087);
cargarCatalogoSalas() {
  this.salasService.getCatalogoSalas()
    .subscribe({
      next: (resp) => {
        this.catSalas= resp.data; 
        this.cdr.detectChanges(); // 👈 fuerza sincronización
      },
      error: (err) => {
        console.error(err);
      }
    });
}

  cargarNomenclatura() {
  this.salasService.getCatNomenclaturas(1, 1, 1).subscribe({
      next: (resp) => {
          this.catNomenclatura= resp.data;
          this.cdr.detectChanges(); // 👈 fuerza sincronización
      },
      error: (error) => {
        console.error('Error al cargar Nomenclatura', error);
      }
    });
}

mostrarTabla: boolean = false;


       
         BusquedaFiltros(): void {
    // const queryParams: Record<string, string | number | null> = {
    //   page: 1,
    //   estado: this.filtro.estado > 0 ? this.filtro.estado : null,
    //   fechaInicio: null,
    //   fechaFinal: null,
    // };
  
    // if (Array.isArray(this.filtros.fechaRecepInicial) && this.filtros.fechaRecepInicial.length === 2) {
    //   queryParams['fechaInicio'] = formatDate(this.filtros.fechaRecepInicial[0], 'yyyy-MM-dd', 'en-US');
    //   queryParams['fechaFinal'] = formatDate(this.filtros.fechaRecepFinal[1], 'yyyy-MM-dd', 'en-US');
    // }
  
    // this.router.navigate([], {
    //   relativeTo: this.route,
    //   queryParams,
    //   queryParamsHandling: 'merge',
    // });
  
    this.cargarDatos();
  }

  cargarDatos(): void {
  //   var requestParams: any = {
  //     "idGeneral": 3315,
  //     "idPantalla": 1,
  //     "idSala": "",
  //     "tipoApelacion": "",
  //     "folioOficialia": "",
  //     "idNomenclatura"  : "",
  // "folioExpediente": "",
  // "expedienteCausa": "",
  // "fechaRecepInicial": "01/01/2025",
  // "fechaRecepFinal": "24/01/2025",
  // "nombreParte": ""
  //    }
  // var requestParams = {
  //     "idGeneral": 3315,
  //     "idPantalla": 1,
  //     "idSala": "",
  //     "tipoApelacion": "",
  //     "folioOficialia": "0837/2023",
  //     "idNomenclatura"  : "",
  // "folioExpediente": "",
  // "expedienteCausa": "",
  // "fechaRecepInicial": "",
  // "fechaRecepFinal": "",
  // "nombreParte": ""
  //    };
console.log('Filtros antes de enviar a la API:', this.filtros);
// this.filtros.IdSala = (this.filtros.IdSala !== undefined && this.filtros.IdSala !== null&& this.filtros.IdSala !== '') ? this.filtros.IdSala.toString() : '';
// this.filtros.IdNomenclatura = (this.filtros.IdNomenclatura !== undefined && this.filtros.IdNomenclatura !== null && this.filtros.IdNomenclatura !== '') ? this.filtros.IdNomenclatura.toString() : '';
// this.filtros.TipoApelacion = (this.filtros.TipoApelacion !== undefined && this.filtros.TipoApelacion !== null && this.filtros.TipoApelacion !== '') ? this.filtros.TipoApelacion.toString() : '';
const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
      const perfilSeleccionado = this.authService.getPerfilSeleccionado();

   this.isLoading=true;
     this.salasService.getListadoInicios(this.filtros).subscribe({
      next: (response) => {
        
        this.listaapelaciones = response?.data[0] ?? null;
        console.log('Respuesta de la API:', this.listaapelaciones?.expediente);
       if (this.listaapelaciones?.expediente && this.listaapelaciones?.expediente.length > 0) {
        this.activeIndex = null;
        }
         // cierra todo panel  activo
        this.isLoading=false;
        this.cdr.markForCheck();
        this.cdr.detectChanges(); // 👈 fuerza sincronización 
      },
      error: (error) => {
       this.isLoading = false;
        console.error('Error:', error);
       
        this.cdr.markForCheck();
      }
    });
  }


  verDetalleApelacion(IdExpediente: string): void {
    console.log('ID Expediente:',  IdExpediente);

    if (!this.listaapelaciones) {
    console.warn('Lista de apelaciones no está definida');
    return;
  }
    const apelacion = this.listaapelaciones?.expediente.filter(expediente => expediente.idExpediente === IdExpediente);
    const partes = this.listaapelaciones?.partes.filter(cliente => cliente.idExpediente === IdExpediente);
    const anexos = this.listaapelaciones?.anexos.filter(cliente => cliente.idExpediente === IdExpediente);


      console.log('Apelación:', apelacion);
  console.log('Partes:', partes);
  console.log('Anexos:', anexos);

    this.router.navigate(['/penal/oficialia/detalle'], { state: {
      apelacion,
      partes,
      anexos} });
  }


  
parseDate(fechaStr: string): Date | null {
  if (!fechaStr) return null;
  
  // Reemplaza "p. m." por "PM" y "a. m." por "AM"
  fechaStr = fechaStr.replace('p. m.', 'PM').replace('a. m.', 'AM');

  // Usa moment.js o Date.parse con cuidado
  const parsedDate = new Date(fechaStr);
  
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}


}
