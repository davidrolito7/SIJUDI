import { Component,OnInit } from '@angular/core';
import { Breadcrub } from "../../../../shared/components/breadcrub/breadcrub";
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectModule  } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from "primeng/button";



interface ListadoEstatus {
    idEstatus: string;
    descripcion: string;
}

@Component({
  selector: 'app-listar-requerimientos',
  imports: [Breadcrub,RadioButtonModule,TableModule,FormsModule,SelectModule,DatePicker,Button],
  templateUrl: './listar-requerimientos.html',
  styleUrl: './listar-requerimientos.css',
   providers: [MessageService]
})

export class ListarRequerimientos implements OnInit {
  // filtro: { rangeDates: Date[] | '', estado: string } = {
  //   rangeDates: '',
  //   estado: '',
  // };

  fechaInicio : Date | undefined;
  fechaFin : Date | undefined;
  filtro: {  estado: string } = {

    estado: '',
  };

  listadoEstatus: ListadoEstatus[] = [{"idEstatus":"0","descripcion":"Todo"},{"idEstatus":"1","descripcion":"Pendiente"},
    {"idEstatus":"2","descripcion":"Expirado"},
    {"idEstatus":"3","descripcion":"Entregados"},{"idEstatus":"4","descripcion":"Aceptado"},
    {"idEstatus":"5","descripcion":"Rechazados"}  ];
    selectedEstatus : ListadoEstatus | undefined;

constructor(private messageService: MessageService){
  
}
   

    ngOnInit() {}


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

 
}
