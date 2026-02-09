import { Component,OnInit } from '@angular/core';
import { Breadcrub } from "../../../../shared/components/breadcrub/breadcrub";
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-listar-requerimientos',
  imports: [Breadcrub,RadioButtonModule,TableModule],
  templateUrl: './listar-requerimientos.html',
  styleUrl: './listar-requerimientos.css',
  standalone: true,
})

export class ListarRequerimientos implements OnInit {
  filtro: { rangeDates: Date[] | '', estado: string } = {
    rangeDates: '',
    estado: '',
  };


   aplicarFiltros(){}

    ngOnInit() {}

 
}
