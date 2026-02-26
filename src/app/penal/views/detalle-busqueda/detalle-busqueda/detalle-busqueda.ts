import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrub } from "../../../../shared/components/breadcrub/breadcrub";
import { DividerModule } from 'primeng/divider';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { Spinner } from "../../../../shared/components/spinner/spinner";


@Component({
  selector: 'app-detalle-busqueda',
  imports: [Breadcrub,
    DividerModule,
    TableModule,
    FormsModule,
    TextareaModule,
    Spinner],
  templateUrl: './detalle-busqueda.html',
  styleUrl: './detalle-busqueda.css',
})
export class DetalleBusqueda {
isLoading:boolean=false;
  apelacion: any[] = [];
  partes: any[] = [];
  anexos: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.isLoading=true;
    const state = history.state;

    this.apelacion = state?.apelacion || [];
    this.partes = state?.partes || [];
    this.anexos = state?.anexos || [];

    
    console.log('Apelación:', this.apelacion);
    console.log('Partes:', this.partes);
    console.log('Anexos:', this.anexos);

    this.isLoading=false;
  }



}
