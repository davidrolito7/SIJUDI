import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Select } from "primeng/select";
import { Button } from "primeng/button";
import { InputTextModule} from 'primeng/inputtext';
import {CommonModule} from '@angular/common';
import { FormControl, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CatalogoAmbito, CatalogoCircuitoResponse, CatalogoClasificacionResponse, CatalogoEstadoResponse, CatalogoMateriasResponse, CatalogoOrganoResponse, CatalogoTipoAsuntoResponse, CatalogoTipoOrganoResponse, CatalogoTipoProcedimientoRespose, ConsultarAsuntoRequest, NotifiViaConsultaAsuntoResponse } from '../../interfaces/amparos.models';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { AmparosService } from '../../services/amparo.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import ValidateForm from '../../../helpers/validateform';
import { Toast } from "primeng/toast";
import { Dialog } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { Router } from '@angular/router';

@Component({
  selector: 'app-iniciar-acuerdo',
  imports: [Spinner, Breadcrub, Button, Select, ReactiveFormsModule, InputTextModule, Toast, Dialog, TableModule,CommonModule],
  templateUrl: './iniciar-acuerdo.html',
  styleUrl: './iniciar-acuerdo.css',
  providers:[MessageService, ConfirmationService]
})
export class IniciarAcuerdo {
isLoading:boolean=false;
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
    tipoProcedimiento: new FormControl(0,Validators.required)
   });



ambitoLista= signal<CatalogoAmbito[]>([]);
clasificacionLista= signal<CatalogoClasificacionResponse[]>([]);
circuitoLista= signal<CatalogoCircuitoResponse[]>([]);
estadoLista= signal<CatalogoEstadoResponse[]>([]);
tipoOrganoLista= signal<CatalogoTipoOrganoResponse[]>([]);
materiaLista= signal<CatalogoMateriasResponse[]>([]);
organoLista= signal<CatalogoOrganoResponse[]>([]);
tipoAsuntoLista= signal<CatalogoTipoAsuntoResponse[]>([]);
tipoProcedimientoLista = signal<CatalogoTipoProcedimientoRespose[]>([]);
asuntoResponse: NotifiViaConsultaAsuntoResponse | undefined;
resultadoDialog = signal<boolean>(false);

constructor(
    private amparosService: AmparosService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,
     private router: Router,
){}

  ngOnInit(){
    this.cargarCatalogoAmbito();
  }
  // Método para cargar el catálogo de tipo de cuaderno
  
  async cargarCatalogoAmbito() {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoAmbito().subscribe({
      next: (response) => {
        if(response.success){
            //console.log('Datos recibidos del catálogo:', response);
            // Asume que la respuesta tiene una estructura como response.data
            this.ambitoLista.set(response.data as CatalogoAmbito[]);
            //console.log(response.data);
            //this.onAmbitoChange(this.acuerdoForm.value.ambito as CatalogoAmbito );
           
          }
          else {
            //console.error('Error al cargar el catálogo de tipos de cuaderno', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo de ambito CFJ' });
          }
        },
      error: (err) => {
         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo de ambito CFJ' });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        //console.log('FIN:');
        this.isLoading=false;
        this.cd.detectChanges();
      }
    })
 
  }
  onAmbitoChange(ambitObjeto: CatalogoAmbito | null): void { 
    this.acuerdoForm.value.clasificacion=null;
    this.clasificacionLista.set([]);
    this.acuerdoForm.value.circuito=null;
    this.circuitoLista.set([]);
    this.acuerdoForm.value.estado=null;
    this.estadoLista.set([]);
    this.acuerdoForm.value.tipoOrgano=null;
    this.tipoOrganoLista.set([]);
    this.acuerdoForm.value.materia=null;
    this.materiaLista.set([]);
    this.acuerdoForm.value.organo=null;
    this.organoLista.set([]);
    this.acuerdoForm.value.tipoAsunto=null;
    this.tipoAsuntoLista.set([]);

    //this.cargarCatalogoClasificacion(ambitObjeto.cjF_catAmbitoId); // Pasa el idAmbito al método para cargar clasificaciones
    if(ambitObjeto !== null)
    {
      this.cargarCatalogoClasificacion(ambitObjeto?.cjF_catAmbitoId ?? 0);
    }
  }

  cargarCatalogoClasificacion(idAmbito: number): void {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoClasificacion(idAmbito).subscribe({
      next:(response:any)=>{
        if(response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          // Asume que la respuesta tiene una estructura como response.data
          //this.acuerdoForm.patchValue({clasificacion: response.data});
          this.clasificacionLista.set(response.data)
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:() => {
        //console.error('Error al cargar la clasificacion de archivos', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de órganos' });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  onClasificacionChange(clasificacionObjeto: CatalogoClasificacionResponse): void {
    this.cargarCatalogoCircuito(this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0, clasificacionObjeto.id);
    this.acuerdoForm.value.circuito=null;
    this.circuitoLista.set([]);
    this.acuerdoForm.value.estado=null;
    this.estadoLista.set([]);
    this.acuerdoForm.value.tipoOrgano=null;
    this.tipoOrganoLista.set([]);
    this.acuerdoForm.value.materia=null;
    this.materiaLista.set([]);
    this.acuerdoForm.value.organo=null;
    this.organoLista.set([]);
    this.acuerdoForm.value.tipoAsunto=null;
    this.tipoAsuntoLista.set([]);
  }

  cargarCatalogoCircuito(idAmbito: number, idClasificacion: number): void {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoCircuito(idAmbito, idClasificacion).subscribe({
      next:(response:any)=>{
        if(response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.circuitoLista.set(response.data);
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        //console.error('Error al cargar la clasificacion de archivos', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de circuitos' });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  onCircuitoChange(circuitoObjeto: CatalogoCircuitoResponse): void {
    this.cargarCatalogoEstado(this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0, this.acuerdoForm.value.clasificacion?.id ?? 0, circuitoObjeto.cjF_catCircuitoId ?? 0);

    this.acuerdoForm.value.estado=null;
    this.estadoLista.set([]);
    this.acuerdoForm.value.tipoOrgano=null;
    this.tipoOrganoLista.set([]);
    this.acuerdoForm.value.materia=null;
    this.materiaLista.set([]);
    this.acuerdoForm.value.organo=null;
    this.organoLista.set([]);
    this.acuerdoForm.value.tipoAsunto=null;
    this.tipoAsuntoLista.set([]);
  }
  cargarCatalogoEstado(idAmbito: number, idClasificacion: number, idCircuito: number): void {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoEstado(idAmbito, idClasificacion, idCircuito).subscribe({
      next:(response:any)=>{
        if(response.success){
          //console.log('Datos recibidos del catálogo:', response);
          this.estadoLista.set(response.data);
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        //console.error('Error al cargar la clasificacion de archivos', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de estados' });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
  });
  }
  onEstadoChange(): void {
    this.cargarCatalogoTipoOrgano(this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0, this.acuerdoForm.value.clasificacion?.id ?? 0, this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0, 1);

    this.acuerdoForm.value.tipoOrgano=null;
    this.tipoOrganoLista.set([]);
    this.acuerdoForm.value.materia=null;
    this.materiaLista.set([]);
    this.acuerdoForm.value.organo=null;
    this.organoLista.set([]);
    this.acuerdoForm.value.tipoAsunto=null;
    this.tipoAsuntoLista.set([]);
  }
  cargarCatalogoTipoOrgano(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number) {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoTipoOrgano(idAmbito, idClasificacion, idCircuito, idTipoFiltro).subscribe({
      next:(response: any)=>{
        if(response.success) {
          //console.log('Datos recibidios de tipoOrgano', response);
          this.tipoOrganoLista.set(response.data);
          //this.filteredTipoOrgano = this.tipoOrgano; // Inicializa las opciones filtradas
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        //console.log('Error al cargar tipo de organo, revisa', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Tipo de organos' });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });

  }
  onTipoOrganoChange(tipoOrganoSelect: CatalogoTipoOrganoResponse): void {
    this.cargarCatalogoMaterias(this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0, this.acuerdoForm.value.clasificacion?.id ?? 0, this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0, 1, this.acuerdoForm.value.estado?.id ?? 0, tipoOrganoSelect.id);

    this.acuerdoForm.value.materia=null;
    this.materiaLista.set([]);
    this.acuerdoForm.value.organo=null;
    this.organoLista.set([]);
    this.acuerdoForm.value.tipoAsunto=null;
    this.tipoAsuntoLista.set([]);
  }
  cargarCatalogoMaterias(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo: number) {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoMaterias(idAmbito, idClasificacion, idCircuito, idTipoFiltro, idEstado, idTipoOrganismo).subscribe({
      next:(response: any)=>{
        if(response.success) {
          //console.log('Datos recibidios de tipoOrgano', response);
          this.materiaLista.set(response.data);
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        //console.log('Error al cargar materias, revisa', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Materia' });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  onTipoMateriaChange(materiaObjeto: CatalogoMateriasResponse): void {
    this.cargarCatalogoOrgano(this.acuerdoForm.value.ambito?.cjF_catAmbitoId ?? 0, this.acuerdoForm.value.clasificacion?.id ?? 0, this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0, 1, this.acuerdoForm.value.estado?.id ?? 0, this.acuerdoForm.value.tipoOrgano?.id ?? 0, materiaObjeto.id);

    this.acuerdoForm.value.organo=null;
    this.organoLista.set([]);
    this.acuerdoForm.value.tipoAsunto=null;
    this.tipoAsuntoLista.set([]);
  }
  cargarCatalogoOrgano(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo: number, idMateria: number) {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoOrgano(idAmbito, idClasificacion, idCircuito, idTipoFiltro, idEstado, idTipoOrganismo, idMateria).subscribe({
      next:(response: any)=>{
        if(response.success) {
          //console.log('Datos recibidios de organo', response);
          this.organoLista.set(response.data);
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        //console.log('Error al cargar organo, revisa', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Materia' });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  /*onTipoAsuntoChange(ambitoObjeto: CatalogoAmbito, clasificacionObjeto: CatalogoClasificacionResponse, circuitoObjeto: CatalogoCircuitoResponse, estadoObjeto: CatalogoEstadoResponse, tipoOrganoObjeto: CatalogoOrganoResponse, materiaObjeto: CatalogoMateriasResponse, organoObjeto: CatalogoTipoOrganoResponse): void {
    this.cargarCatalogoTipoAsunto(ambitoObjeto.cjF_catAmbitoId, clasificacionObjeto.id, circuitoObjeto.cjF_catCircuitoId, 1, estadoObjeto.id, tipoOrganoObjeto.id, materiaObjeto.id, organoObjeto.id);
  }*/
  cargarCatalogoTipoAsunto(organo: CatalogoOrganoResponse) {
    const idTipoFiltro=1;
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoTipoAsunto(this.acuerdoForm.value.ambito?.cjF_catAmbitoId ??0,this.acuerdoForm.value.clasificacion?.id ?? 0, this.acuerdoForm.value.circuito?.cjF_catCircuitoId ?? 0, idTipoFiltro, this.acuerdoForm.value.estado?.id ?? 0, this.acuerdoForm.value.tipoOrgano?.id ?? 0, this.acuerdoForm.value.materia?.id ?? 0, organo.id).subscribe({
      next:(response:any)=>{
        if(response.success) {
          //console.log('Datos recibidios de organo', response);
          this.tipoAsuntoLista.set(response.data);
          this.tipoProcedimientoLista.set([]);
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        //console.log('Error al cargar tipoAsunto, revisa', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Tipo Asunto' });
        this.isLoading=false;
        this.cd.detectChanges();

      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  cargaCatalogoTipoProcedimiento() {
    if(this.acuerdoForm.value.tipoAsunto === null || this.acuerdoForm.value.tipoAsunto === undefined){
      this.tipoProcedimientoLista.set([]);
      return;
    }
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoTipoProcedimiento(this.acuerdoForm.value.tipoAsunto.id ?? 0).subscribe({
      next:(response:any)=>{
        if(response.success) {
          this.tipoProcedimientoLista.set(response.data);
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Tipo procedimiento' });
        this.isLoading=false;
        this.cd.detectChanges();

      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }

  

  buscarAsunto(): void {
      // Verificar si alguno de los campos requeridos está vacío o no definido
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
  
      // Crear el objeto con los parámetros necesarios
      const consultaParams: ConsultarAsuntoRequest = {
          numeroDeAsunto: this.acuerdoForm.value.numeroAsunto ?? '',
          idOrgano: this.acuerdoForm.value.organo?.id.toString() ?? '',
          idTipoAsunto: this.acuerdoForm.value.tipoAsunto?.id ?? 0,
          idMateria: this.acuerdoForm.value.materia?.id ?? 0,
          idTipoProcedimiento: this.acuerdoForm.value.tipoProcedimiento ?? 0 // Asegurarse de que sea un número
      };
  
      // Llamar al método del servicio que realiza la consulta
      this.consultarAsunto(consultaParams);
  }
  consultarAsunto(params: ConsultarAsuntoRequest): void {
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.consultarAsunto(params).subscribe({
      next:(response)=>{       
        // Verificar si el servicio tuvo éxito
        if (!response.success || !response.data) {
          this.messageService.add({ 
            severity: 'warn', 
            summary: 'No encontrado', 
            detail: 'No se encontraron resultados para los datos proporcionados' 
          });
          return; 
        }
        this.asuntoResponse=response.data;
        if(this.asuntoResponse){
          this.asuntoResponse.organoDescripcion = this.acuerdoForm.value.organo?.descripcion;
          this.asuntoResponse.asuntoDescripcion = this.acuerdoForm.value.tipoAsunto?.descripcion;
          this.asuntoResponse.materiaDescripcion = this.acuerdoForm.value.materia?.descripcion;
        }
        this.resultadoDialog.set(true);
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error al consultar el asunto, intente más tarde' 
        });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        //console.log('FIN:');
        this.isLoading=false;
        this.cd.detectChanges();
      }
     
    });
  }
  guardarAsunto(){
      const params: ConsultarAsuntoRequest = {
        numeroDeAsunto: this.asuntoResponse?.numeroDeAsunto.toString() ?? '',
        idOrgano: String(this.asuntoResponse?.idOrgano),
        idTipoAsunto: this.asuntoResponse?.idTipoAsunto ?? 0,
        idMateria: this.asuntoResponse?.idMateria ?? 0,
        idTipoProcedimiento: Number(this.asuntoResponse?.idTipoProcedimiento)
      }
      this.isLoading=true;
      this.cd.detectChanges();
      this.amparosService.guardarAsunto(params).subscribe({
        next:(response)=>{
          
          // Verificar si el servicio tuvo éxito
          if (!response.success || !response.data) {
            this.messageService.add({ 
              severity: 'warn', 
              summary: 'No encontrado', 
              detail: 'No se encontraron resultados para los datos proporcionados' 
            });
          }else{
            var idNotificacion = response.data.idNotificacion;
            //lanzamos el detalle de la notificacion
            this.router.navigate(['amparos/detalles-amparo-recibido'], { state: { idNotificacion } });
          }
        },
        error: (err) => {
          //console.error("Error al obtener el listado de amparos", err);
          //this.loading = false;
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error al consultar el asunto, intente más tarde' 
          });
          this.isLoading=false;
          this.cd.detectChanges();
        },
        complete:()=>{
          //console.log('FIN:');
          this.isLoading=false;
          this.cd.detectChanges();
        }
       
      });
    
  }
  hideDialogResultado(){
    this.resultadoDialog.set(false);
  }

  get dropdownClasificacionDisabled(): boolean {
    return !this.acuerdoForm.value.ambito || this.clasificacionLista().length ===0;
  }
  get dropdownCircuitoDisabled(): boolean {
    return !this.acuerdoForm.value.clasificacion || this.circuitoLista().length === 0;
  }
  get dropdownEstadoDisabled(): boolean {
    return !this.acuerdoForm.value.circuito || this.estadoLista().length===0;
  }
  get dropdownTipoOrganoDisabled(): boolean {
    return !this.acuerdoForm.value.estado || this.tipoOrganoLista().length===0;
  }
  get dropdownMateriaDisabled(): boolean {
    return !this.acuerdoForm.value.tipoOrgano || this.materiaLista().length===0;
  }
  get dropdownOrganoDisabled(): boolean {
    return !this.acuerdoForm.value.materia || this.organoLista().length===0;
  }
  get dropdownTipoAsuntoDisabled(): boolean {
    return !this.acuerdoForm.value.organo || this.tipoAsuntoLista().length===0;
  }
  get dropdownTipoProcedimientoDisabled(): boolean {
    return !this.acuerdoForm.value.tipoAsunto || this.tipoProcedimientoLista().length === 0;
  }
}
