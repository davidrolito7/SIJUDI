import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { OverlayModule } from 'primeng/overlay';
import { AccordionModule } from 'primeng/accordion';
import { DrawerModule } from 'primeng/drawer';
import { DatePickerModule } from 'primeng/datepicker';
import { SplitterModule } from 'primeng/splitter';
import { CatApelaciones, CatSalas, Nomenclatura } from '../../interface/salas.interface';
import { SalasService } from '../../service/salas.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  busquedaExpediente,
  DTABusqueda,
  responseDataBusqueda,
} from '../../interface/salas.interface';
import { InputMaskModule } from 'primeng/inputmask';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { AuthService } from '../../../core/auth/service/auth.service';

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
    InputMaskModule,
    IconFieldModule,
    InputIconModule,
    Spinner,
  ],
  templateUrl: './busqueda-apelaciones.html',
  styleUrl: './busqueda-apelaciones.css',
  providers: [MessageService],
})
export class BusquedaApelaciones implements OnInit {
  isLoading: boolean = false;

  catApelaciones: CatApelaciones[] = [];

  catNomenclatura: Nomenclatura[] = [];

  catSalas: CatSalas[] = [];
  activeIndex: string | null = null;

  Id_pantalla: number = 1;

  resultados: any[] = [];

  filtros = {
   // IdPantalla: null as string | number | null,
    FolioOficialia: '' as string | null,
    IdSala: null as string | number | null,
    IdNomenclatura: null as string | number | null,
    FolioExpediente: '',
    TipoApelacion: null as string | null,
    ExpedienteCausa: '',
    NombreParte: '',
    FechaRecepInicial: null,
    FechaRecepFinal: null,
  };

  salas = [
    { id: 1, nombre: 'Primera Sala' },
    { id: 2, nombre: 'Segunda Sala' },
  ];

  apelaciones = [];
  listaapelaciones: responseDataBusqueda | null = null;

  lstapelaciones = signal<busquedaExpediente[]>([]);

  selected: any;

  date2: Date | undefined;

  ngOnInit(): void {
    this.cargarApelaciones();
    this.cargarNomenclatura();

    this.cargarCatalogoSalas();

    this.route.queryParams.subscribe(params => {
    if (Object.keys(params).length) {
      this.filtros = { ...this.filtros, ...params }; // Actualiza los filtros con los parámetros de la URL
    
    }
  });

    this.cargarDatos();
    this.activeIndex = (0).toString(); // Establece el primer panel como activo
  }

  constructor(
    private salasService: SalasService,
    public authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

 

  limpiar() {
    this.filtros = {
    //  IdPantalla: null,
      FolioOficialia: '',
      IdSala: null,
      IdNomenclatura: null,
      FolioExpediente: '',
      TipoApelacion: null,
      ExpedienteCausa: '',
      NombreParte: '',
      FechaRecepInicial: null,
      FechaRecepFinal: null,
    };
  }

  clear(table: Table) {
    table.clear();
  }

  cargarApelaciones() {
    const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
    this.salasService.getCatApelaciones(Number(idAreaSistemaUsuario), this.Id_pantalla).subscribe({
      next: (resp) => {
        this.catApelaciones = resp.data;
        this.cdr.detectChanges(); // 👈 fuerza sincronización
      },
      error: (error) => {
        console.error('Error al cargar apelaciones', error);
      },
    });
  }

  cargarCatalogoSalas() {
    const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
    this.salasService.getCaSalas(Number(idAreaSistemaUsuario), this.Id_pantalla).subscribe({
      next: (resp) => {
        this.catSalas = resp.data;
        this.cdr.detectChanges(); // 👈 fuerza sincronización
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  cargarNomenclatura() {
    const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
    this.salasService
      .getCatNomenclaturas(Number(idAreaSistemaUsuario), this.Id_pantalla)
      .subscribe({
        next: (resp) => {
          this.catNomenclatura = resp.data;
          this.cdr.detectChanges(); // 👈 fuerza sincronización
        },
        error: (error) => {
          console.error('Error al cargar Nomenclatura', error);
        },
      });
  }

  mostrarTabla: boolean = false;

  BusquedaFiltros(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
    const perfilSeleccionado = this.authService.getPerfilSeleccionado();

    

    this.router.navigate([], {
      relativeTo: this.route,
  queryParams: this.filtros,
  queryParamsHandling: 'merge',
});

//this.filtros.IdPantalla = this.Id_pantalla;
    this.isLoading = true;
    this.salasService.getListadoDemandas(this.filtros,this.Id_pantalla).subscribe({
      next: (response) => {
        this.listaapelaciones = response?.data[0] ?? null;

        if (this.listaapelaciones?.expediente && this.listaapelaciones?.expediente.length > 0) {
          this.activeIndex = null;
        }
        // cierra todo panel  activo
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges(); // 👈 fuerza sincronización
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error:', error);

        this.cdr.markForCheck();
      },
    });
  }

  verDetalleApelacion(IdExpediente: string): void {
    if (!this.listaapelaciones) {
      console.warn('Lista de apelaciones no está definida');
      return;
    }
    const apelacion = this.listaapelaciones?.expediente.filter(
      (expediente) => expediente.idExpediente === IdExpediente,
    );
    const partes = this.listaapelaciones?.partes.filter(
      (cliente) => cliente.idExpediente === IdExpediente,
    );
    const anexos = this.listaapelaciones?.anexos.filter(
      (cliente) => cliente.idExpediente === IdExpediente,
    );

    this.router.navigate(['/penal/oficialia/detalle'], {
      state: {
        apelacion,
        partes,
        anexos,
      },
    });
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


