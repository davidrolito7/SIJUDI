import { Component, OnInit } from '@angular/core';
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
import { CatApelaciones, CatSalas, Nomenclatura } from '../../interface/salas.interface';
import { SalasService } from '../../service/salas.service';
import { response } from 'express';

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

  ],
  templateUrl: './busqueda-apelaciones.html',
  styleUrl: './busqueda-apelaciones.css',
})
export class BusquedaApelaciones implements OnInit  {

  catApelaciones: CatApelaciones[] = [];

  catNomenclatura: Nomenclatura [] = [];
  
  catSalas: CatSalas[] = [];

  ngOnInit(): void {
  //  this.cargarApelaciones();
    this.cargarNomenclatura();
  //  this.cargarSalas();
  this.cargarCatalogoSalas();
    this.cargarCatalogo();
  }


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

  buscar() {
    console.log('Filtros:', this.filtros);
    // aquí llamas tu API
  }
  constructor(private salasService: SalasService) {}
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
  selected: any;

        date2: Date | undefined;

  cargarApelaciones() {
  this.salasService.getCatApelaciones(1, 1, 1).subscribe({
      next: (resp) => {
          this.catApelaciones= resp.data;
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
      },
      error: (err) => {
        console.error(err);
      }
    });
}

cargarCatalogoSalas() {
  this.salasService.getCatalogoSalas()
    .subscribe({
      next: (resp) => {
        this.catSalas= resp.data; 
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
      },
      error: (error) => {
        console.error('Error al cargar Nomenclatura', error);
      }
    });
}

}
