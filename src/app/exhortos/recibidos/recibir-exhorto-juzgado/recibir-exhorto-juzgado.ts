import { Component } from '@angular/core';

import { CatalogoMateria, CatalogoMunicipioDestino, ConfigMateriaJuzgado, ReasignarJuzgado, actualizacionesExhortoRecibido } from '../../interfaces/exhortos.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ExhortosService } from '../../services/exhorto.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-recibir-exhorto-juzgado',
  imports: [FormsModule, SelectModule, FloatLabelModule, InputTextModule, CheckboxModule, ToastModule, ConfirmDialog, ButtonModule, TextareaModule, TableModule],
  templateUrl: './recibir-exhorto-juzgado.html',
  styleUrl: './recibir-exhorto-juzgado.css',
  providers: [MessageService, ConfirmationService],

})
export class RecibirExhortoJuzgado {
  constructor(
    private messageService: MessageService,
    private ExhortosService: ExhortosService,
    private router: Router,
    private confirmationService: ConfirmationService,

  ) { }

  listaMunicipioOrigen: CatalogoMunicipioDestino[] = [];
  selectMunicipioOrigen: CatalogoMunicipioDestino | null = null;

  listaMateria: CatalogoMateria[] = [];
  selectMateria: CatalogoMateria | null = null;

  listaJuzgado: ConfigMateriaJuzgado[] = [];
  selectedJuzgado: ConfigMateriaJuzgado | null = null;

  idExhortoRecibido: number | undefined;
  materiaNombre: string = '';
  numeroExhorto: string = '';
  municipioDestino: string = '';
  juzgadoDestino: string = '';
  observaciones: string | null = null;

  listaActualizaciones: actualizacionesExhortoRecibido[] = [];

  ngOnInit() {
    const state = window.history.state as { idExhortoRecibido: number; materiaNombre: string, numeroExhorto: string, municipioDestino: string, juzgadoDestino: string };

    if (state && state.idExhortoRecibido) {
      this.idExhortoRecibido = state.idExhortoRecibido;
      this.materiaNombre = state.materiaNombre || '';
      this.numeroExhorto = state.numeroExhorto || '';
      this.municipioDestino = state.municipioDestino || '';
      this.juzgadoDestino = state.juzgadoDestino || '';
    } else {
      // Si no hay state, redirigir a la lista de amparos
      this.router.navigate(['/inicio/exhortos']);
    }

    this.CatalogoMateria().then(() => {
      // Una vez que los datos están cargados, preselecciona la materia
      if (this.materiaNombre) {
        this.preselectMateria(this.materiaNombre);
      }
    });

    this.CatalogoMunicipiosOaxaca();
    this.cargarActualizacionesDelExhorto();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor rellene todos los campos.',
        life: 3000
      });
      return;
    }

    this.confirmationService.confirm({
      key: 'reasignarJuzgado',
      accept: () => this.reasignarJuzgado(form),
    });
  }

  reasignarJuzgado(form: NgForm) {


    const data: ReasignarJuzgado = {
      idExhortoRecibido: this.idExhortoRecibido!,
      idMunicipio: this.selectMunicipioOrigen?.idMunicipio!,
      idCatJuzgado: this.selectedJuzgado?.idJuzgado!,
      idCatMateria: this.selectMateria?.clave!,
      observaciones: this.observaciones || ''
    };


    this.ExhortosService.postReasignarJuzgado(data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'El juzgado fue reasignado correctamente, se enviaran las actualizaciones al juzgado exhortante...',
            life: 3000
          });

          // Limpia los valores de los dropdowns y el textarea
          this.selectMateria = null;
          this.selectMunicipioOrigen = null;
          this.selectedJuzgado = null;
          this.observaciones = null;

          // Reinicia el formulario y establece valores iniciales
          form.resetForm({
            selectMateria: null,
            selectMunicipioOrigen: null,
            selectedJuzgado: null,
            observaciones: null
          });

          this.ExhortosService.enviarActualizacionesExhorto(data.idExhortoRecibido).subscribe({
            next: (response: any) => {
              if (response.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Las actualizaciones fueron enviadas al juzgado exhortante correctamente.',
                  life: 3000
                });
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: response.message || 'No fue posible enviar las actualizaciones, intente enviarlo nuevamente desde el listado de actualizaciones',
                  life: 3000
                });
              }
            },
            error: (e) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No fue posible enviar las actualizaciones, intente enviarlo nuevamente desde el listado de actualizaciones',
                life: 3000
              });
              console.error('Error al reasignar el juzgado:', e);
            }
          });
          this.cargarActualizacionesDelExhorto();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Ocurrió un error al reasignar el juzgado.',
            life: 3000
          });
        }
      },
      error: (e) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al procesar la solicitud.',
          life: 3000
        });
        console.error('Error al reasignar el juzgado:', e);
      }
    });
  }

  CatalogoMunicipiosOaxaca() {
    this.ExhortosService.getCatalogoMunicipioOaxaca().subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaMunicipioOrigen = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de Municipios', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias', life: 3000 });
      },
    });
  }

  CatalogoMateria(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ExhortosService.getCatalogoMateria().subscribe({
        next: (response: any) => {
          if (response.success) {
            //console.log('Datos recibidos del catálogo:', response);
            this.listaMateria = response.data;
            resolve();
          }
          else {
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
          }
        },
        error: (e) => {
          //console.error('Error al cargar el catálogo de Materia', e);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias', life: 3000 });
        },
      });
    });
  }

  preselectMateria(materiaNombre: string) {
    //console.log('Lista de materias:', this.listaMateria);
    //console.log('MateriaNombre recibido:', materiaNombre); // Verifica el valor recibido

    const materiaNormalizada = materiaNombre.trim().toLowerCase();
    //console.log('Materia normalizada:', materiaNormalizada); // Verifica la normalización    

    const materiaEncontrada = this.listaMateria.find(
      (materia) => materia.nombre.trim().toLowerCase().includes(materiaNormalizada)
    );

    //console.log('Materia encontrada:', materiaEncontrada); // Verifica si se encontró la materia
    if (materiaEncontrada) {
      this.selectMateria = materiaEncontrada;
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontró ninguna materia con el nombre:' + materiaNombre + '', life: 3000 });
    }
  }

  onSelectionChange() {
    // Verifica que ambos valores estén seleccionados
    if (this.selectMunicipioOrigen && this.selectMateria) {
      const idMunicipio = this.selectMunicipioOrigen.idMunicipio; // ID del municipio seleccionado
      const idMateria = this.selectMateria.clave; // ID de la materia seleccionada

      // Llama al método ConfigMuncipioJuzgado con los IDs
      this.ConfigMuncipioJuzgado(idMunicipio, idMateria);
    }
  }


  ConfigMuncipioJuzgado(idMunicipio: number, idMateria: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ExhortosService.getConfigMunicipioMateriaJuzgado(idMunicipio, idMateria).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.listaJuzgado = response.data;
            resolve(); // Resuelve la promesa cuando los datos están cargados
          } else {
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
            reject(response.message); // Rechaza la promesa si hay un error en la respuesta
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de configuraciones' });
          reject(e); // Rechaza la promesa si ocurre un error HTTP
        }
      });
    });
  }

  cargarActualizacionesDelExhorto() {
    if (this.idExhortoRecibido !== undefined) {
      this.ExhortosService.getActualizacionesExhortoRecibido(this.idExhortoRecibido!).subscribe({
        next: (response) => {
          if (response.success) {
            this.listaActualizaciones = response.data;
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
          }

        },
        error: (e) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
        },
        complete: () => {
          //console.log('FIN:');
        }
      });
    }
  }

  abrirConfirmacionEnviarActualizacion(idActualizacion: number) {
    this.confirmationService.confirm({
      key: 'enviarActualizacion',
      accept: () => this.enviarActualizacion(idActualizacion),
    });
  }

  enviarActualizacion(idActualizacion: number) {
    if (idActualizacion !== undefined) {
      this.ExhortosService.enviarActualizacion(idActualizacion).subscribe({
        next: (response => {
          if (response.success) {
            if (response.data != null) {
              this.messageService.add({ severity: 'success', summary: 'Ok', detail: "Actualización enviada", icon: 'pi pi-check-circle' });
              this.cargarActualizacionesDelExhorto();
            }
            else {
              this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
            }
          }
          else
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
        }),
        error: (err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }),
        complete: () => {
          //console.log('fin');
        }

      });
    }
  }

}