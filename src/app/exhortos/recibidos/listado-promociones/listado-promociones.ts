import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { ExhortosService } from '../../services/exhorto.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router } from "@angular/router";
import { ToastModule } from 'primeng/toast';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { AuthService } from '../../../core/auth/service/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListadoExhortosRecibidosI, UI_ParamlistadoExhortosRecibidosRequest, ListadoEstatus } from "../../interfaces/exhortos.model";

@Component({
  selector: 'app-listado-promociones',
  imports: [DatePicker, TableModule, InputTextModule, TagModule, SelectModule, ButtonModule, IconFieldModule, InputIconModule,
    BreadcrumbModule, AvatarModule, InputMaskModule, FloatLabelModule, ToastModule, CommonModule, FormsModule, Spinner, TooltipModule],
  templateUrl: './listado-promociones.html',
  styleUrl: './listado-promociones.css',
  providers: [MessageService]
})
export class ListadoPromociones {
  //Declaramos variables
  isLoading: boolean = false;
  idPantalla = 1008;
  listadoEstatus: ListadoEstatus[] = [];
  //selectedEstatus : number=5; ///se ponme en 5 por que es el valor del estatus "recibidos"
  selectedEstatus: ListadoEstatus | undefined;
  fechaInicio: Date | undefined;
  fechaFin: Date | undefined;
  fechaMaxima: Date | undefined;
  formSubmitted: boolean = false;
  response!: GenericResponse<ListadoExhortosRecibidosI[]>;
  listadosExhortos = signal<ListadoExhortosRecibidosI[]>([]);
  tienePermisoVerAcuerdo = signal<boolean>(false);

  verAcuerdos(idExhortoRecibido: number) {
    //console.log('Naavegando a detalle-promocion con idPromocion:', idExhortoRecibido);
    this.router.navigate(['/exhortos/respuesta-exhorto-recibido'], { state: { idExhortoRecibido } });

  }

  constructor(
    private exhortoService: ExhortosService,
    public authService: AuthService,
    public router: Router,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {

  }
  ngOnInit(): void {

  }

  //Obtenemos el listado de promociones recibidas
  getListado(): Promise<void> {
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      this.formSubmitted = true;
      // Utilizar fechas predeterminadas si date1 o date2 no están definidas
      let fechaIni = this.fechaInicio;
      let fechaFin = this.fechaFin;
      [fechaIni, fechaFin] = [this.fechaInicio, this.fechaFin];

      if (fechaIni === null) {

        fechaIni = undefined;
      }
      if (fechaFin === null) {
        fechaFin = undefined;
      }


      const perfil = this.authService.getRoleNameUsuario(); // Obtener perfil del servicio
      const area = this.authService.getAreaUsuario();

      const obj = {
        fechaIni: fechaIni,
        fechaFin: fechaFin,
        ////  perfil: perfil,
        estatus: this.selectedEstatus?.idEstatus,
        ////   IdAreaAdminAplicaciones : area 
      };
      console.log(this.selectedEstatus?.idEstatus);

      this.cd.detectChanges();

      this.exhortoService.getExhortosRecibidosListado(obj).subscribe({
        next: (res => {
          this.response = res as any;
          if (this.response.success) {
            //console.log("Respuesta del servidor:", this.response);
            this.listadosExhortos.set(this.response.data);

          } else {
            // Manejo de errores
            this.messageService.add({ severity: 'error', summary: this.response.message, detail: this.response.errors[0] })
          }
          //this.loading = false;
        }),
        error: (err => {
          // Manejo de errores
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el listado de exhortos' });
          this.isLoading = false;
          this.cd.detectChanges();
        }),
        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    });
  }

  clear(table: Table) {
    // this.fechaInicial = undefined;
    // this.fechaFinal = undefined;
    table.clear();
  }

  getTagConfig(estatus: string): { icon: string; severity: 'success' | 'warn' | 'info' | 'secondary' | 'danger' | 'contrast' } {
    switch (estatus) {
      case 'Respondido':
        return { icon: 'pi pi-reply', severity: 'info' };          // Azul - respondido
      case 'Acordado':
        return { icon: 'pi pi-check-circle', severity: 'success' };// Verde - completado
      case 'Recibido':
        return { icon: 'pi pi-inbox', severity: 'contrast' };      // Oscuro - recibido (marcado/registrado)
      case 'Pendiente de recibir':
        return { icon: 'pi pi-clock', severity: 'warn' };          // Naranja - pendiente
      case 'En proceso de diligencia':
        return { icon: 'pi pi-spinner', severity: 'secondary' };   // Gris - en curso
      default:
        return { icon: 'pi pi-question-circle', severity: 'secondary' };
    }
  }

  verDetalleNotificacion(idExhortoRecibido: number) {
    //console.log('Naavegando a detalle-exhorto con idExhortoRecibido:', idExhortoRecibido);
    this.router.navigate(['/exhortos/detalles-exhorto-recibido'], { state: { idExhortoRecibido } });

  }

  resetFilter() {
    // Limpiar fechas
    //localStorage.removeItem('dateE3');
    //localStorage.removeItem('dateE4');

    this.fechaInicio = undefined;
    this.fechaFin = undefined;

    // Limpiar resultados visibles
    this.listadosExhortos.set([]);

    // Mostrar mensaje opcional
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros reiniciados',
      detail: 'Fechas y resultados han sido limpiados'
    });
  }


}
