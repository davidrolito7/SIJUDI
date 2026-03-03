import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { DividerModule } from 'primeng/divider';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { Spinner } from "../../../shared/components/spinner/spinner";
import {  CommonModule,formatDate,DatePipe } from '@angular/common';
import { busquedaExpediente, DTABusqueda, responseDataBusqueda } from '../../interface/salas.interface';
import { CardModule  } from 'primeng/card';

@Component({
  selector: 'app-detalle-busqueda',
  imports: [CommonModule,Breadcrub,
    DividerModule,
    TableModule,
    FormsModule,
    TextareaModule,
    Spinner,CardModule ],
  templateUrl: './detalle-busqueda.html',
  styleUrl: './detalle-busqueda.css',
})
export class DetalleBusqueda {
isLoading:boolean=false;
  // apelacion: any[] = [];
  partes: any[] = [];
  anexos: any[] = [];

  apelacion:  busquedaExpediente[] = [];


 /* anexos
: 
"4"
anexosDetalle
: 
null
apelacion
: 
"RESOLUCION"
esReposicion
: 
"NO"
expedienteAcumulado
: 
""
expediente_Causa
: 
"0253/2025"
fechadeAuto
: 
"22/10/2025 12:00:00 a. m."
fechadeIngresoaSala
: 
""
fechadeRecepcion
: 
"12/02/2026 02:32:48 p. m."
foliodeApelacion
: 
"JOTPAI/0006/2026"
foliodeApelacionAnterior
: 
"N/A"
foliodeOficialia
: 
"0174/2026"
foliodelOficio
: 
"PJEO/CJ/TAT/1339/2026-J"
idCatApelacion
: 
"7"
idCatJuzgadoOrigen
: 
"154"
idCatTipoApelacion
: 
""
idCatTipoEscrito
: 
"2"
idCatTipoTramite
: 
"1"
idExpediente
: 
"285064"
idSala
: 
"2092"
idSalaAnterior
: 
""
juzgadoOrigen
: 
"JUZGADO DE CONTROL DE TANIVET"
noFojas
: 
"1"
observacionesdelaApelacion
: 
"DELITO: HOMICIDIO CALIFICADO CON VENTAJA"
partes
: 
null
sala
: 
"NOVENA SALA PENAL UNITARIA"
salaAnterior
: 
"N/A"
tipodeApelacion
: 
""
tipodeEscrito
: 
"TESTIMONIO"
tramite
: 
"APELACIÓN"*/

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

parseDate(fechaStr: string): Date | null {
  if (!fechaStr) return null;
  
  // Reemplaza "p. m." por "PM" y "a. m." por "AM"
  fechaStr = fechaStr.replace('p. m.', 'PM').replace('a. m.', 'AM');

  // Usa moment.js o Date.parse con cuidado
  const parsedDate = new Date(fechaStr) ;
  
  
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

}
