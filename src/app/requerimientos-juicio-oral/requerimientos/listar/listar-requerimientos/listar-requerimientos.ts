import { Component,OnInit } from '@angular/core';
import { Breadcrub } from "../../../../shared/components/breadcrub/breadcrub";
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-requerimientos',
  imports: [Breadcrub,RadioButtonModule,TableModule,FormsModule],
  templateUrl: './listar-requerimientos.html',
  styleUrl: './listar-requerimientos.css'
})

export class ListarRequerimientos implements OnInit {
  // filtro: { rangeDates: Date[] | '', estado: string } = {
  //   rangeDates: '',
  //   estado: '',
  // };

  filtro: {  estado: string } = {

    estado: '',
  };


   aplicarFiltros(){}

    ngOnInit() {}

 
}
