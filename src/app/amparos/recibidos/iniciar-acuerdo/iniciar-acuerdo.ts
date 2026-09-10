import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Select } from "primeng/select";
import { Button } from "primeng/button";
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CatalogoAmbito, CatalogoCircuitoResponse, CatalogoClasificacionResponse, CatalogoEstadoResponse, CatalogoMateriasResponse, CatalogoOrganoResponse, CatalogoTipoAsuntoResponse, CatalogoTipoOrganoResponse, CatalogoTipoProcedimientoRespose, ConsultarAsuntoRequest, NotifiViaConsultaAsuntoResponse } from '../../interfaces/amparos.models';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { AmparosService } from '../../services/amparo.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import ValidateForm from '../../../helpers/validateform';
import { Toast } from "primeng/toast";
import { Dialog } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { Router } from '@angular/router';

@Component({
  selector: 'app-iniciar-acuerdo',
  imports: [Spinner, Button, Select, ReactiveFormsModule, InputTextModule, Toast, Dialog, TableModule, CommonModule],
  templateUrl: './iniciar-acuerdo.html',
  styleUrl: './iniciar-acuerdo.css',
  providers: [MessageService, ConfirmationService]
})
export class IniciarAcuerdo {
  isLoading: boolean = false;

  acuerdoForm = new FormGroup({
    ambito: new FormControl(null as CatalogoAmbito | null, Validators.required),
    clasificacion: new FormControl(null as CatalogoClasificacionResponse | null, Validators.required),
    circuito: new FormControl(null as CatalogoCircuitoResponse | null, Validators.required),
    estado: new FormControl(null as CatalogoEstadoResponse | null, Validators.required),
    tipoOrgano: new FormControl(null as CatalogoTipoOrganoResponse | null, Validators.required),
    materia: new FormControl(null as CatalogoMateriasResponse | null, Validators.required),
    organo: new FormControl(null as CatalogoOrganoResponse | null, Validators.required),
    tipoAsunto: new FormControl(null as CatalogoTipoAsuntoResponse | null, Validators.required),
    numeroAsunto: new FormControl('', Validators.required),
    tipoProcedimiento: new FormControl(0, Validators.required)
  });

  ambitoLista = signal<CatalogoAmbito[]>([]);
  clasificacionLista = signal<CatalogoClasificacionResponse[]>([]);
  circuitoLista = signal<CatalogoCircuitoResponse[]>([]);
  estadoLista = signal<CatalogoEstadoResponse[]>([]);
  tipoOrganoLista = signal<CatalogoTipoOrganoResponse[]>([]);
  materiaLista = signal<CatalogoMateriasResponse[]>([]);
  organoLista = signal<CatalogoOrganoResponse[]>([]);
  tipoAsuntoLista = signal<CatalogoTipoAsuntoResponse[]>([]);
  tipoProcedimientoLista = signal<CatalogoTipoProcedimientoRespose[]>([]);
  asuntoResponse: NotifiViaConsultaAsuntoResponse | undefined;
  resultadoDialog = signal<boolean>(false);

  constructor(
    private amparosService: AmparosService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit() {
    this.cargarCatalogoAmbito();
  }

  // ==========================================================
  // AMBITO
  // ==========================================================
  cargarCatalogoAmbito() {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoAmbito().subscribe({
      next: (response) => {
        if (response.success) {
          this.ambitoLista.set(response.data as CatalogoAmbito[]);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo de ambito CFJ' });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo de ambito CFJ' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  onAmbitoChange(ambitoObjeto: CatalogoAmbito | null): void {
    this.limpiarDesdeAmbito();

    if (ambitoObjeto !== null) {
      this.cargarCatalogoClasificacion(ambitoObjeto?.cjF_catAmbitoId ?? 0);
    }
  }

  cargarCatalogoClasificacion(idAmbito: number): void {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoClasificacion(idAmbito).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.clasificacionLista.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de órganos' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================================
  // CLASIFICACION
  // ==========================================================
  onClasificacionChange(clasificacionObjeto: CatalogoClasificacionResponse): void {
    const ambitoId = this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0;

    this.cargarCatalogoCircuito(ambitoId, clasificacionObjeto.id);
    this.limpiarDesdeClasificacion();
  }

  cargarCatalogoCircuito(idAmbito: number, idClasificacion: number): void {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoCircuito(idAmbito, idClasificacion).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.circuitoLista.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de circuitos' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================================
  // CIRCUITO
  // ==========================================================
  onCircuitoChange(circuitoObjeto: CatalogoCircuitoResponse): void {
    const ambitoId = this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0;
    const clasificacionId = this.acuerdoForm.value.clasificacion?.id ?? 0;

    this.cargarCatalogoEstado(ambitoId, clasificacionId, circuitoObjeto.cjF_catCircuitoId ?? 0);
    this.limpiarDesdeCircuito();
  }

  cargarCatalogoEstado(idAmbito: number, idClasificacion: number, idCircuito: number): void {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoEstado(idAmbito, idClasificacion, idCircuito).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.estadoLista.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de estados' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================================
  // ESTADO
  // ==========================================================
  onEstadoChange(): void {
    const ambitoId = this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0;
    const clasificacionId = this.acuerdoForm.value.clasificacion?.id ?? 0;
    const circuitoId = this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0;

    this.cargarCatalogoTipoOrgano(ambitoId, clasificacionId, circuitoId, 1);
    this.limpiarDesdeEstado();
  }

  cargarCatalogoTipoOrgano(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number) {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoTipoOrgano(idAmbito, idClasificacion, idCircuito, idTipoFiltro).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tipoOrganoLista.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Tipo de organos' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================================
  // TIPO ORGANO
  // ==========================================================
  onTipoOrganoChange(tipoOrganoSelect: CatalogoTipoOrganoResponse): void {
    const ambitoId = this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0;
    const clasificacionId = this.acuerdoForm.value.clasificacion?.id ?? 0;
    const circuitoId = this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0;
    const estadoId = this.acuerdoForm.value.estado?.id ?? 0;

    this.cargarCatalogoMaterias(ambitoId, clasificacionId, circuitoId, 1, estadoId, tipoOrganoSelect.id);
    this.limpiarDesdeTipoOrgano();
  }

  cargarCatalogoMaterias(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo: number) {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoMaterias(idAmbito, idClasificacion, idCircuito, idTipoFiltro, idEstado, idTipoOrganismo).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.materiaLista.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Materia' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================================
  // MATERIA
  // ==========================================================
  onTipoMateriaChange(materiaObjeto: CatalogoMateriasResponse): void {
    const ambitoId = this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0;
    const clasificacionId = this.acuerdoForm.value.clasificacion?.id ?? 0;
    const circuitoId = this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0;
    const estadoId = this.acuerdoForm.value.estado?.id ?? 0;
    const tipoOrganoId = this.acuerdoForm.value.tipoOrgano?.id ?? 0;

    this.cargarCatalogoOrgano(ambitoId, clasificacionId, circuitoId, 1, estadoId, tipoOrganoId, materiaObjeto.id);
    this.limpiarDesdeMateria();
  }

  cargarCatalogoOrgano(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo: number, idMateria: number) {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoOrgano(idAmbito, idClasificacion, idCircuito, idTipoFiltro, idEstado, idTipoOrganismo, idMateria).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.organoLista.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Materia' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================================
  // ORGANO
  // ==========================================================
  cargarCatalogoTipoAsunto(organo: CatalogoOrganoResponse): void {
    const idTipoFiltro = 1;
    const ambitoId = this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0;
    const clasificacionId = this.acuerdoForm.value.clasificacion?.id ?? 0;
    const circuitoId = this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0;
    const estadoId = this.acuerdoForm.value.estado?.id ?? 0;
    const tipoOrganoId = this.acuerdoForm.value.tipoOrgano?.id ?? 0;
    const materiaId = this.acuerdoForm.value.materia?.id ?? 0;

    this.limpiarDesdeOrgano();

    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.getCatalogoTipoAsunto(ambitoId, clasificacionId, circuitoId, idTipoFiltro, estadoId, tipoOrganoId, materiaId, organo.id)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.tipoAsuntoLista.set(response.data);
            this.tipoProcedimientoLista.set([]);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Tipo Asunto' });
          this.isLoading = false;
          this.cd.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
  }

  // ==========================================================
  // TIPO ASUNTO
  // ==========================================================
  onTipoAsuntoChange(): void {
    this.acuerdoForm.patchValue({ tipoProcedimiento: 0 }, { emitEvent: false });
    this.cargaCatalogoTipoProcedimiento();
  }

  cargaCatalogoTipoProcedimiento() {
    if (this.acuerdoForm.value.tipoAsunto === null || this.acuerdoForm.value.tipoAsunto === undefined) {
      this.tipoProcedimientoLista.set([]);
      return;
    }
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoTipoProcedimiento(this.acuerdoForm.value.tipoAsunto.id ?? 0).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tipoProcedimientoLista.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Tipo procedimiento' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================================
  // BUSQUEDA / GUARDADO
  // ==========================================================
  buscarAsunto(): void {
    if (!this.acuerdoForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, selecciona todos los valores requeridos.'
      });
      this.acuerdoForm.markAllAsTouched();
      ValidateForm.validateAllFormFields(this.acuerdoForm);
      return;
    }

    const consultaParams: ConsultarAsuntoRequest = {
      numeroDeAsunto: this.acuerdoForm.value.numeroAsunto ?? '',
      idOrgano: this.acuerdoForm.value.organo?.id.toString() ?? '',
      idTipoAsunto: this.acuerdoForm.value.tipoAsunto?.id ?? 0,
      idMateria: this.acuerdoForm.value.materia?.id ?? 0,
      idTipoProcedimiento: this.acuerdoForm.value.tipoProcedimiento ?? 0
    };

    this.consultarAsunto(consultaParams);
  }

  consultarAsunto(params: ConsultarAsuntoRequest): void {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.consultarAsunto(params).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No encontrado',
            detail: 'No se encontraron resultados para los datos proporcionados'
          });
          return;
        }
        this.asuntoResponse = response.data;
        if (this.asuntoResponse) {
          this.asuntoResponse.organoDescripcion = this.acuerdoForm.value.organo?.descripcion;
          this.asuntoResponse.asuntoDescripcion = this.acuerdoForm.value.tipoAsunto?.descripcion;
          this.asuntoResponse.materiaDescripcion = this.acuerdoForm.value.materia?.descripcion;
        }
        this.resultadoDialog.set(true);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al consultar el asunto, intente más tarde'
        });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  guardarAsunto() {
    const params: ConsultarAsuntoRequest = {
      numeroDeAsunto: this.asuntoResponse?.numeroDeAsunto.toString() ?? '',
      idOrgano: String(this.asuntoResponse?.idOrgano),
      idTipoAsunto: this.asuntoResponse?.idTipoAsunto ?? 0,
      idMateria: this.asuntoResponse?.idMateria ?? 0,
      idTipoProcedimiento: Number(this.asuntoResponse?.idTipoProcedimiento)
    };
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.guardarAsunto(params).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No encontrado',
            detail: 'No se encontraron resultados para los datos proporcionados'
          });
        } else {
          const idNotificacion = response.data.idNotificacion;
          this.router.navigate(['amparos/detalles-amparo-recibido'], { state: { idNotificacion } });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al consultar el asunto, intente más tarde'
        });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  hideDialogResultado() {
    this.resultadoDialog.set(false);
  }

  // ==========================================================
  // CASCADA DE LIMPIEZA
  // Cada nivel limpia su propio control/lista y delega el resto
  // al siguiente nivel de la cadena.
  // ==========================================================
  private limpiarDesdeAmbito(): void {
    this.acuerdoForm.patchValue({ clasificacion: null }, { emitEvent: false });
    this.clasificacionLista.set([]);
    this.limpiarDesdeClasificacion();
  }

  private limpiarDesdeClasificacion(): void {
    this.acuerdoForm.patchValue({ circuito: null }, { emitEvent: false });
    this.circuitoLista.set([]);
    this.limpiarDesdeCircuito();
  }

  private limpiarDesdeCircuito(): void {
    this.acuerdoForm.patchValue({ estado: null }, { emitEvent: false });
    this.estadoLista.set([]);
    this.limpiarDesdeEstado();
  }

  private limpiarDesdeEstado(): void {
    this.acuerdoForm.patchValue({ tipoOrgano: null }, { emitEvent: false });
    this.tipoOrganoLista.set([]);
    this.limpiarDesdeTipoOrgano();
  }

  private limpiarDesdeTipoOrgano(): void {
    this.acuerdoForm.patchValue({ materia: null }, { emitEvent: false });
    this.materiaLista.set([]);
    this.limpiarDesdeMateria();
  }

  private limpiarDesdeMateria(): void {
    this.acuerdoForm.patchValue({ organo: null }, { emitEvent: false });
    this.organoLista.set([]);
    this.limpiarDesdeOrgano();
  }

  private limpiarDesdeOrgano(): void {
    this.acuerdoForm.patchValue({ tipoAsunto: null, tipoProcedimiento: 0 });
    this.tipoAsuntoLista.set([]);
    this.tipoProcedimientoLista.set([]);
  }

  // ==========================================================
  // GETTERS DE ESTADO DISABLED
  // ==========================================================
  get dropdownClasificacionDisabled(): boolean {
    return !this.acuerdoForm.value.ambito || this.clasificacionLista().length === 0;
  }
  get dropdownCircuitoDisabled(): boolean {
    return !this.acuerdoForm.value.clasificacion || this.circuitoLista().length === 0;
  }
  get dropdownEstadoDisabled(): boolean {
    return !this.acuerdoForm.value.circuito || this.estadoLista().length === 0;
  }
  get dropdownTipoOrganoDisabled(): boolean {
    return !this.acuerdoForm.value.estado || this.tipoOrganoLista().length === 0;
  }
  get dropdownMateriaDisabled(): boolean {
    return !this.acuerdoForm.value.tipoOrgano || this.materiaLista().length === 0;
  }
  get dropdownOrganoDisabled(): boolean {
    return !this.acuerdoForm.value.materia || this.organoLista().length === 0;
  }
  get dropdownTipoAsuntoDisabled(): boolean {
    return !this.acuerdoForm.value.organo || this.tipoAsuntoLista().length === 0;
  }
  get dropdownTipoProcedimientoDisabled(): boolean {
    return !this.acuerdoForm.value.tipoAsunto || this.tipoProcedimientoLista().length === 0;
  }
}