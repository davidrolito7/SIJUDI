import { Component, CreateEffectOptions, effect, inject, Output, signal, Signal, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
import { TableModule } from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { CatJuzgado } from '../../../catalogos/interface/catalogo.model';
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
    DrawerModule

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
    }, { allowSignalWrites: true } as CreateEffectOptions);
  }

  listaMateria: CatalogoMateria[] = [];
  listaMunicipiosOaxaca: CatalogoMunicipioDestino[] = [];
  listaMatJuz: ConfigMateriaJuzgado[] = [];
  listaMatJuzAll: ConfigMateriaJuzgado[] = [];
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
  accionPendiente: string | null = null; // Almacena la acción pendiente (form1 o form2)
  mostrarDialogo: boolean = false; // Controla la visibilidad del diálogo
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>(); // Emite cambios al padre
  tienePermisoAgregarJuzgadoMateria = false;

  ngOnInit() {
    this.CatalogoMateria();
    this.CatalogoMunicipiosOaxaca();
    this.GetSeccionesUsuario();
    this.CatalogoJuzgado();
    this.CatalogoRegion();
    this.perfilSeleccionado = signal(this.perfilSeleccionadoService.perfil_Seleccionado());
  }

  onMunicipioChange(event: any) {
    this.selectedMunicipio = event.value;
  }

  onSubmit(form: NgForm) {
    this.formSubmitted = true;
    if (form.invalid) {
      //console.log('Formulario incorrecto');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor rellene todos los campos.',
        life: 3000
      });
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      }); // Marca todos los campos como tocados para mostrar errores
      return;
    }

    // Obtén los valores del formulario
    const materia = form.value.materia; // Valor del campo "Tipo de Materia"
    const municipio = form.value.municipio; // Valor del campo "Municipio"

    this.cargarConfig(municipio.idMunicipio, materia.clave);

    // Imprime los valores en la consola
    //console.log('Formulario enviado:', { materia, municipio });
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
  //se agrega esta funcion intermedia para usar await y detectChanges porque no refrescaba la vista
  async cargarConfig(municipioId: number, idMateria: number) {
    await this.ConfigMuncipioJuzgado(municipioId, idMateria);
    this.cd.detectChanges();
    // Aquí Angular sí detecta el cambio porque el flujo sigue dentro de su zona
  }

  ConfigMuncipioJuzgado(idMunicipio: number, idMateria: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ExhortosService.getConfigMunicipioMateriaJuzgado(idMunicipio, idMateria).subscribe({
        next: (response: any) => {
          if (response.success) {
            //setTimeout(() => {
              if (idMunicipio === 0 && idMateria === 0) {
                this.listaMatJuzAll = response.data ? [...response.data] : [];
              } else {
                this.listaMatJuz = response.data ? [...response.data] : [];
              }
              this.formSubmitted=false;
              resolve();
            //});
          } else {
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
            reject(response.message);
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de configuraciones' });
          reject(e);
        }
      });
    });
  }

  abrirModal() {
    this.visible = true;
  }

  async descargarJSON() {
    let jsonData = null;
    // Paso 1: Convertir los datos a formato JSON
    if (this.listaMatJuz.length === 0) {

      // Esperar a que los datos se carguen
      await this.ConfigMuncipioJuzgado(0, 0);

      // Verificar si los datos se cargaron correctamente
      if (!this.listaMatJuzAll || this.listaMatJuzAll.length === 0) {
        alert('No hay datos disponibles para descargar.');
        return;
      }

      // Generar JSON con los datos completos
      jsonData = JSON.stringify(this.listaMatJuzAll, null, 2);
    }
    else {
      jsonData = JSON.stringify(this.listaMatJuz, null, 2);
    }


    // Paso 2: Crear un Blob con los datos
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Paso 3: Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_juzgados.json'; // Nombre del archivo
    document.body.appendChild(a);
    a.click();

    // Paso 4: Limpiar el enlace temporal
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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

  onSubmitGuardar(form: NgForm, formId: string) {
    this.formSubmitted = true;
    if (form.invalid) {
      //console.log('Formulario incorrecto');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor rellene todos los campos.',
        life: 3000
      });
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      }); // Marca todos los campos como tocados para mostrar errores
      return;
    }

    // Muestra el diálogo de confirmación
    this.accionPendiente = formId; // Guarda la acción pendiente
    this.mostrarDialogo = true; // Muestra el diálogo

  }

  confirmarAccion(confirmado: boolean) {
    this.mostrarDialogo = false; // Oculta el diálogo

    if (confirmado && this.accionPendiente === 'form1') {
      this.AgregarJuzgadoConf();
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'El juzgado-Materia fue guardado correctamente.',
        life: 3000
      });
      this.cerrarModal();
    } else if (confirmado && this.accionPendiente === 'form2') {
    } else if (!confirmado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Operación cancelada.',
        life: 3000
      });
    }

    this.accionPendiente = null; // Limpia la acción pendiente
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

  CatalogoRegion() {
    this.ExhortosService.getCatalogoRegion().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.listaRegion = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: () => {
        //console.error('Error al cargar el catálogo de materias', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Región' });
      },
    });
  }

  AgregarJuzgadoConf() {
    this.ExhortosService.postAgregarJuzgadoMat(this.selectedMunicipioRegion?.idMunicipio,
      this.selectMateria?.clave, this.selectedJuzgado?.idJuzgado, this.selectRegion?.idRegion).subscribe({
        next: (response: any) => {
          if (response.success) {

          }
          else {
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
          }
        },
        error: () => {
          //console.error('Error al cargar el catálogo de materias', e);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al añadir un juzgado Materia' });
        },
      });
  }

}
