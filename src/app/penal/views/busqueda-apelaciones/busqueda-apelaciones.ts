import { Component } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { OverlayModule } from 'primeng/overlay';
import { AccordionModule  } from 'primeng/accordion';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { DatePickerModule } from 'primeng/datepicker';
import { SplitterModule } from 'primeng/splitter';
import { Card } from 'primeng/card';

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
})
export class BusquedaApelaciones {
  resultados: any[] = [];

  filtros = {
    folioOficial: '',
    sala: null,
    nomenclatura: null,
    folioApelacion: '',
    apelacion: null,
    expediente: '',
    nombreParte: '',
    fechaInicio: null,
    fechaFin: null,
  };

  salas = [
    { id: 1, nombre: 'Primera Sala' },
    { id: 2, nombre: 'Segunda Sala' },
  ];

  apelaciones = [];

  buscar() {
    console.log('Filtros:', this.filtros);
    // aquí llamas tu API
  }

  limpiar() {
    this.filtros = {
      folioOficial: '',
      sala: null,
      nomenclatura: null,
      folioApelacion: '',
      apelacion: null,
      expediente: '',
      nombreParte: '',
      fechaInicio: null,
      fechaFin: null,
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
}
