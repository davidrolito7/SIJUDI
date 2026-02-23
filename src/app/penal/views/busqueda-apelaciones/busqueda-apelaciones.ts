import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { OverlayModule } from 'primeng/overlay';
import { AccordionModule  } from 'primeng/accordion';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { DatePickerModule } from 'primeng/datepicker';
import { SplitterModule } from 'primeng/splitter';
import { Card } from 'primeng/card';

import { SalasService } from '../../service/salas.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { busquedaExpediente, DTABusqueda, responseDataBusqueda } from '../../interface/salas.interface';

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
    Card
  ],
  templateUrl: './busqueda-apelaciones.html',
  styleUrl: './busqueda-apelaciones.css',
  providers: [MessageService],
})
export class BusquedaApelaciones {
  resultados: any[] = [];

  filtros = {
    "idGeneral": 3315,
      "idPantalla": 1,
    folioOficial: '',
    idSala: '',
    idNomenclatura: '',
    folioExpediente: '',
    tipoApelacion: '',
    expedienteCausa: '',
    nombreParte: '',
    fechaRecepInicial: null,
    fechaRecepFinal: null,
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
    

   constructor(
    private salasService: SalasService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }


    ngOnInit(): void {    
    this.cargarDatos();
  }

  buscar() {
    console.log('Filtros:', this.filtros);
    // aquí llamas tu API
  }

  limpiar() {
    this.filtros = {
      "idGeneral": 3315,
      "idPantalla": 1,
      folioOficial: '',
      idSala: '',
      idNomenclatura: '',
      folioExpediente: '',
      tipoApelacion: '',
      expedienteCausa: '',
      nombreParte: '',
      fechaRecepInicial: null,
      fechaRecepFinal: null,
    };
  }
  nomenclaturas: any[] = [];
  selected: any;
  visible: boolean = false;



     visible1: boolean = false;
    visible2: boolean = false;
    visible3: boolean = false;
    visible4: boolean = false;

mostrarTabla: boolean = false;
        date2: Date | undefined;


       
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
  var requestParams = {
      "idGeneral": 3315,
      "idPantalla": 1,
      "idSala": "",
      "tipoApelacion": "",
      "folioOficialia": "0837/2023",
      "idNomenclatura"  : "",
  "folioExpediente": "",
  "expedienteCausa": "",
  "fechaRecepInicial": "",
  "fechaRecepFinal": "",
  "nombreParte": ""
     };
   
     this.salasService.getListadoInicios(this.filtros).subscribe({
      next: (response) => {
        //this.isLoading = false;
        //this.lstapelaciones.set(response?.data[0] ?? []);
        this.listaapelaciones = response?.data[0] ?? null;
        console.log('Respuesta de la API:', this.listaapelaciones?.expediente);
       // this.pagination = response.pagination;
        //this.listaRequerimientos().forEach(r => this.actualizarTiempo(r));
        this.cdr.markForCheck();
      },
      error: (error) => {
       // this.isLoading = false;
        console.error('Error:', error);
        this.cdr.markForCheck();
      }
    });
  }




}
