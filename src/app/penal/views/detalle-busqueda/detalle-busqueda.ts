import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { DividerModule } from 'primeng/divider';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { CommonModule, formatDate, DatePipe } from '@angular/common';
import {
  busquedaExpediente,
  DTABusqueda,
  responseDataBusqueda,
} from '../../interface/salas.interface';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-detalle-busqueda',
  imports: [
    CommonModule,
    Header,
    DividerModule,
    TableModule,
    FormsModule,
    TextareaModule,
    Spinner,
    CardModule,
  ],
  templateUrl: './detalle-busqueda.html',
  styleUrl: './detalle-busqueda.css',
})
export class DetalleBusqueda {
  isLoading: boolean = false;
  // apelacion: any[] = [];
  partes: any[] = [];
  anexos: any[] = [];

  apelacion: busquedaExpediente[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.isLoading = true;
    const state = history.state;

    this.apelacion = state?.apelacion || [];
    this.partes = state?.partes || [];
    this.anexos = state?.anexos || [];

    console.log('Apelación:', this.apelacion);
    console.log('Partes:', this.partes);
    console.log('Anexos:', this.anexos);

    this.isLoading = false;
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


