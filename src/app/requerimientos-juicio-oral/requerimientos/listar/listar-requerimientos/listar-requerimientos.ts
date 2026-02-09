import { Component } from '@angular/core';
import { Breadcrub } from "../../../../shared/components/breadcrub/breadcrub";
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-listar-requerimientos',
  imports: [Breadcrub,RadioButtonModule],
  templateUrl: './listar-requerimientos.html',
  styleUrl: './listar-requerimientos.css',
  standalone: true,
})

export class ListarRequerimientos {
  filtro: { rangeDates: Date[] | '', estado: string } = {
    rangeDates: '',
    estado: '',
  };


   aplicarFiltros(){}

}
