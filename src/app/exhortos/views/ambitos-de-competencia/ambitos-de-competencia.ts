import { Component, CreateEffectOptions, effect, inject, Output, signal, Signal, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CatalogoMateria, CatalogoMunicipioDestino, CatalogoRegion, ConfigMateriaJuzgado } from '../../interfaces/exhortos.model';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { ExhortosService } from '../../services/exhorto.service';
import { AuthService } from '../../../core/auth/service/auth.service';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { CatJuzgado } from '../../../catalogos/interface/catalogo.model';
import {InputIconModule} from 'primeng/inputicon'

@Component({
  selector: 'app-ambitos-de-competencia',
  imports: [
    FloatLabelModule,
    CommonModule,
    FormsModule,
    SelectModule,
    DialogModule,
    ToastModule,
    TableModule,
    ButtonModule,
    DrawerModule,
    InputIconModule

  ], templateUrl: './ambitos-de-competencia.html',
  styleUrl: './ambitos-de-competencia.css',
  providers: [MessageService]

})
export class AmbitosDeCompetencia {
  constructor(
    private messageService: MessageService,
    private ExhortosService: ExhortosService,
    public authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    //Detecta si el perfil seleccionado ha cambiado y actualiza las secciones
    this.perfilSeleccionado = signal(this.perfilSeleccionadoService.perfil_Seleccionado());
   effect(() => {
     this.perfilSeleccionado = signal(this.perfilSeleccionadoService.perfil_Seleccionado());
     this.GetSeccionesUsuario();
   });
  }

  listaMateria: CatalogoMateria[] = [];
  listaMunicipiosOaxaca: CatalogoMunicipioDestino[] = [];
  listaMatJuz: ConfigMateriaJuzgado[] = [];
  listaConfiJuzgado: ConfigMateriaJuzgado[] = [];
  selectedMunicipio: CatalogoMunicipioDestino | null = null
  isHeightExpanded = false;
  visible: boolean = false;
  materiaSelect: any;
  formSubmitted: boolean = false;
  confirmacionEliminarJuzgado: boolean = false

  loading: boolean = false;
  visibleDrawer: boolean = false;
  //Asignar el id de la pantalla, para poder obtener las secciones(permisos) de esta pantalla
  idPantalla = 14147;

  secciones: secciones[] = [];
  responseSecciones!: GenericResponse<secciones[]>;

  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado!: Signal<string>;
  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoAnadirJuzgadoMateria = false;
  tienePermisoEliminarAsignacion = false;

  selectMateria: CatalogoMateria | null = null;

  listaMunicipiosRegion: CatalogoMunicipioDestino[] = [];
  selectedMunicipioRegion: CatalogoMunicipioDestino | null = null;

  listaRegion: CatalogoRegion[] = [];
  selectRegion: CatalogoRegion | null = null;

  listaJuzgado: CatJuzgado[] = [];
  selectedJuzgado: CatJuzgado | null = null;

  selectedNuevoJuzgado: string | null = null;
  // accionPendiente: string | null = null; // Almacena la acción pendiente (form1 o form2)
  // mostrarDialogo: boolean = false; // Controla la visibilidad del diálogo
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>(); // Emite cambios al padre
  tienePermisoAgregarJuzgadoMateria = false;
  @ViewChild('dt1') dt1?: Table;

  ngOnInit() {
    this.getConfigMuncipioJuzgado();
    this.CatalogoMateria();
    this.CatalogoMunicipiosOaxaca();
    this.GetSeccionesUsuario();
    this.CatalogoJuzgado();
    this.CatalogoRegion();
    this.perfilSeleccionado = signal(this.perfilSeleccionadoService.perfil_Seleccionado());
  }
  private defer(fn: () => void): void {
    Promise.resolve().then(fn); // microtask (no setTimeout)
  }
  onMunicipioChange(event: any) {
    this.selectedMunicipio = event.value;
  }


  abrirConfirmacionEliminarJuzgado() {
    this.confirmacionEliminarJuzgado = true
  }

  eliminarJuzgado(juzgado: ConfigMateriaJuzgado) {
    //console.log('Eliminando juzgado:', juzgado);
    this.ExhortosService.getQuitarAsignacionJuzgado(juzgado.idConfiguracion).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaMatJuz = this.listaMatJuz.filter(item => item !== juzgado);
          //this.listaMateria = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar un Juzgado' });
      },
    });
    this.confirmacionEliminarJuzgado = false
  }

  CatalogoMateria() {
    this.ExhortosService.getCatalogoMateria().subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaMateria = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de Materia', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Materias' });
      },
    });
  }


  CatalogoMunicipiosOaxaca() {
    this.ExhortosService.getCatalogoMunicipioOaxaca().subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaMunicipiosOaxaca = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de Municipios', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Municipios' });
      },
    });
  }
  getConfigMuncipioJuzgado(): void {

    this.ExhortosService.getConfigMunicipioMateriaJuzgado(0, 0)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.listaConfiJuzgado = response.data ? [...response.data] : []; // nueva referencia
          } else {
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
          }
        },
        error: () => {
          this.cd.detectChanges();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el catálogo de configuraciones'
          });
        }
      });
  }

  abrirModal() {
    this.visible = true;
  }

exportarCSV(dt?: Table): void {
    // Si hay filtros activos, PrimeNG llena filteredValue con los registros visibles
    const tieneFiltrosActivos = this.tieneFiltrosActivos(dt);
    const data: any[] = (tieneFiltrosActivos && dt?.filteredValue?.length)
      ? dt.filteredValue
      : (this.listaConfiJuzgado ?? []);

    if (!data.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay datos para exportar.',
        life: 3000
      });
      return;
    }

    // Columnas que ves en la tabla
    const headers = ['Región', 'Municipio', 'Materia', 'Juzgado'];

    const lines = data.map(row => ([
      row.region ?? '',
      row.municipio ?? '',
      row.materia ?? '',
      row.juzgado ?? ''
    ]).map(this.csvEscape).join(','));

    // BOM para que Excel respete acentos/UTF-8
    const csv = '\uFEFF' + headers.map(this.csvEscape).join(',') + '\r\n' + lines.join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ambitos_competencia.csv';
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private tieneFiltrosActivos(dt?: Table): boolean {
    const filters = dt?.filters;
    if (!filters) return false;

    return Object.values(filters).some((f: any) => {
      if (Array.isArray(f)) return f.some(m => m?.value !== null && m?.value !== undefined && String(m.value).trim() !== '');
      return f?.value !== null && f?.value !== undefined && String(f.value).trim() !== '';
    });
  }

  private csvEscape(value: any): string {
    const s = String(value ?? '');
    // Escapa comillas y envuelve en comillas si hay separadores/saltos
    const escaped = s.replace(/"/g, '""');
    return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
  }

  GetSeccionesUsuario(): Promise<void> {
    return new Promise((resolve, reject) => {
      const idAreaSistemaUsuario = localStorage.getItem('idAreaSistemaUsuario');
      const perfilSeleccionado = localStorage.getItem('perfilSeleccionado');
      this.authService.GetSeccionesUsuario(idAreaSistemaUsuario, this.idPantalla.toString(), perfilSeleccionado)
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.secciones = res.data;
              if (this.secciones === null || this.secciones === undefined) {
                this.tienePermisoAnadirJuzgadoMateria = false;
                this.tienePermisoEliminarAsignacion = false;
                this.tienePermisoAgregarJuzgadoMateria = false;

              }
              else if (this.secciones.length > 0) {
                this.tienePermisoAnadirJuzgadoMateria = this.secciones.some(s => s.descripcion === 'AñadirJuzgadoMateria');
                this.tienePermisoEliminarAsignacion = this.secciones.some(s => s.descripcion === 'EliminarAsignacion');
                this.tienePermisoAgregarJuzgadoMateria = this.secciones.some(s => s.descripcion === 'AgregarJuzgadoMateria');

              }
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error en la respuesta del servidor." });
            }
            this.loading = false;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
            this.loading = false;
          }
        });
    });
  }

  onSubmit(form: NgForm) {
    console.log('SUBMIT value:', form.value, 'valid=', form.valid);

    this.formSubmitted = true;

    if (form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor rellene todos los campos.',
        life: 3000
      });

      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });

      return;
    }

    this.AgregarJuzgadoConf(form);
  }

  AgregarJuzgadoConf(form?: NgForm) {
    // Validación defensiva (por si algo viene null)
    if (!this.selectedMunicipioRegion || !this.selectMateria || !this.selectedJuzgado || !this.selectRegion) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Faltan datos para guardar la relación.',
        life: 3000
      });
      return;
    }

    this.ExhortosService
      .postAgregarJuzgadoMat(
        this.selectedMunicipioRegion.idMunicipio,
        this.selectMateria.clave,
        this.selectedJuzgado.idJuzgado,
        this.selectRegion.idRegion
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'El juzgado-materia fue guardado correctamente.',
              life: 3000
            });

            // refresca tabla si aplica
            this.getConfigMuncipioJuzgado();

            // cierra y limpia
            this.cerrarDrawer();
            form?.resetForm();
          } else {
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al añadir un juzgado Materia'
          });
        }
      });
  }

  private cerrarDrawer(): void {
    this.visibleDrawer = false;

    // Limpia selección del formulario del drawer
    this.selectedMunicipioRegion = null;
    this.selectedJuzgado = null;
    this.selectMateria = null;
    this.selectRegion = null;

    this.formSubmitted = false;
  }

  cerrarModal() {
    this.visible = false;
    this.visibleChange.emit(this.visible); // Notifica al padre

    this.selectedMunicipioRegion = null;
    this.selectedJuzgado = null;
    this.selectMateria = null;
    this.selectRegion = null;
    this.selectedNuevoJuzgado = null;
  }

  onJuzgadoChange(event: any) {
    this.selectedJuzgado = event.value;
  }

  onRegionChange(event: any) {
    this.selectRegion = event.value;
    if (this.selectRegion) {
      this.CatalogoRegionMunicipio(this.selectRegion.idRegion);
    }
  }
  CatalogoRegionMunicipio(idRegion: number) {
    this.ExhortosService.getCatalogoRegionMunicipio(idRegion).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaMunicipiosRegion = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: () => {
        console.error('Error al cargar el catálogo de Municipios');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Region-Municipio' });
      },
    });
  }

  CatalogoJuzgado() {
    this.ExhortosService.getCatalogoJuzgado().subscribe({
      next: (response: any) => {
        if (response.success) { //console.log('Datos recibidos del catálogo:', response);
          this.listaJuzgado = response.data;
          console.log(this.listaJuzgado)
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: () => {
        //console.error('Error al cargar el catálogo de materias', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Juzgados' });
      },
    });
  }


  CatalogoRegion(): void {

    this.ExhortosService.getCatalogoRegion().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.listaRegion = response.data ? [...response.data] : [];
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
        }
      },
      error: () => {
        this.cd.detectChanges();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Región' });
      },
      complete: () => {
        this.cd.detectChanges();
      }
    });
  }
    get totalRegistros(): number {
    const dt = this.dt1;

    // si hay filtros activos y hay filteredValue, usa eso
    if (this.tieneFiltrosActivos(dt) && dt?.filteredValue) {
      return dt.filteredValue.length;
    }

    // si no hay filtros, usa el total de la lista completa
    return (this.listaConfiJuzgado?.length ?? 0);
  }
}
