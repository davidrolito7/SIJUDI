import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Select } from "primeng/select";
import { Button } from "primeng/button";
import { FormControl, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CatalogoAmbito, CatalogoCircuitoResponse, CatalogoClasificacionResponse, CatalogoEstadoResponse, CatalogoMateriasResponse, CatalogoOrganoResponse, CatalogoTipoAsuntoResponse, CatalogoTipoOrganoResponse } from '../../interfaces/amparos.models';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { AmparosService } from '../../services/amparo.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-iniciar-acuerdo',
  imports: [Spinner, Breadcrub, Button, Select,ReactiveFormsModule],
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
    tipoAsunto: new FormControl(null as CatalogoTipoAsuntoResponse | null, Validators.required)
   });
ambito= signal<CatalogoAmbito[]>([]);

constructor(
    private amparosService: AmparosService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
){}

ngOnInit(){
  this.cargarCatalogoAmbito();
}
// Método para cargar el catálogo de tipo de cuaderno
  
  async cargarCatalogoAmbito() {
    this.isLoading=true;

    this.amparosService.getCatalogoAmbito().subscribe({
      next: (response) => {
        if(response.success){
            //console.log('Datos recibidos del catálogo:', response);
            // Asume que la respuesta tiene una estructura como response.data
            this.ambito.set(response.data as CatalogoAmbito[]);
            //console.log(response.data);
            //this.onAmbitoChange(this.acuerdoForm.value.ambito as CatalogoAmbito );
           
          }
          else {
            //console.error('Error al cargar el catálogo de tipos de cuaderno', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo de ambito CFJ' });
          }
        },
      error: (err) => {
        console.error("Error al obtener el listado de amparos", err);
      },
      complete:()=>{
        //console.log('FIN:');
      }
    })
 
  }
  onAmbitoChange(ambitObjeto: CatalogoAmbito): void {
  
    this.acuerdoForm.value.clasificacion=null;
    this.acuerdoForm.value.circuito=null;
    this.acuerdoForm.value.estado=null;
    
    
    this.tipoOrganoSelect = null;  // Resetear selección de circuito
    this.tipoOrgano = [];  // Limpia las opciones de circuito
    this.materiaSelect = null;  // Resetear selección de circuito
    this.materia = [];
    this.organoSelect = null;  // Resetear selección de circuito
    this.organo = [];
    this.tipoAsuntoSelect = null;  // Resetear selección de circuito
    this.tipoAsunto = [];

      //this.cargarCatalogoClasificacion(ambitObjeto.cjF_catAmbitoId); // Pasa el idAmbito al método para cargar clasificaciones
      if(this.ambitoSelect)
      {
        this.cargarCatalogoClasificacion(this.ambitoSelect.cjF_catAmbitoId);
      }
  }

  cargarCatalogoClasificacion(idAmbito: number): void {
    this.amparosService.getCatalogoClasificacion(idAmbito).subscribe(
      (response: any) => {
        //console.log('Datos recibidos del catálogo:', response);
        // Asume que la respuesta tiene una estructura como response.data
        this.clasificacion = response.data;
      },
      error => {
        //console.error('Error al cargar la clasificacion de archivos', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de órganos' });
      }
    );
  }
}
