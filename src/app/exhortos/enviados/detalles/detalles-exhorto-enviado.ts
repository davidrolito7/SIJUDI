import { ChangeDetectorRef, Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Avatar } from 'primeng/avatar';
import { MenuItem, MessageService,ConfirmationService } from 'primeng/api';
import { ToastModule } from "primeng/toast";
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Router } from '@angular/router';
import {ButtonModule} from 'primeng/button'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TableModule } from "primeng/table";
import { Dialog, DialogModule } from "primeng/dialog";
import { actualizacionesExhortoEnviado, ArchivoRecibidoPromocionConAcuse, detalleExhortosEnviados, PromocionExhortoEnviado, respuestExhortoEnviado, 
         VerMovimientosEnviadosResponse,archivoExhortoEnviado } from '../../interfaces/exhortos.model';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { AuthService } from '../../../core/auth/service/auth.service';
import { ExhortosService } from '../../services/exhorto.service';
import { downloadBase64,base64ToFile } from '../../../shared/functions/utils';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import generateExEnviadosPDF from '../../reportes/rptExhortoEnviado';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";

@Component({
  selector: 'app-DetallesExhortoEnviado',
  imports: [Breadcrumb, Avatar, Spinner, ToastModule, CommonModule, ButtonModule, TableModule, ConfirmDialog, DialogModule, PdfDialog, Breadcrub],
  templateUrl: './detalles-exhorto-enviado.html',
  styleUrl: './detalles-exhorto-enviado.css',
  providers: [MessageService,ConfirmationService]
})
export class DetallesExhortoEnviado {
  isLoading: boolean = false;
  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  //fileContent: SafeResourceUrl | undefined;
  visible: boolean = false;
  detallesExhortos = signal<detalleExhortosEnviados | null>(null);

  detallesExhortosPromocion= signal<PromocionExhortoEnviado[]>([]);

  tieneRespuesta: boolean = false; //Para deshabilitar el botón de "ver respuesta"
  idExhortoEnviado: number | undefined;



  //generalesPromocionEnviado : boolean = false;
  listaActualizaciones:actualizacionesExhortoEnviado[]=[];
  //archivosPromocionEnviado : boolean = false;
  respuesta: respuestExhortoEnviado[]=[];
  indice: number = 0

  //movimientos: VerMovimientosEnviadosResponse[] = [];
  movimientos=signal<VerMovimientosEnviadosResponse[]>([]);
  //idPromocionEnviadoSeleccionado: number | null = null;
  //Asignar el id de la pantalla, para poder obtener las secciones(permisos) de esta pantalla
  idPantalla=14195;
  secciones : secciones[] = [] ;
  responseSecciones!: GenericResponse<secciones[]>;
  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado! : Signal<string>;

  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo

  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoPromover= signal<boolean>(false);
  tienePermisoVerRespuesta = signal<boolean>(false);
  tienePermisoEditarExhorto = signal<boolean>(false);
  tienePermisoPromocionEditar = signal<boolean>(false);
  tienePermisoPromocionEnviarGenerales  = signal<boolean>(false);
  tienePermisoPromocionEnviarArchivos = signal<boolean>(false);

  //@ViewChild('modal2') modal2!: ModalComponent;
  archivoRecibidoPromocionConAcuse! :ArchivoRecibidoPromocionConAcuse;

  constructor(
    private exhortosService: ExhortosService,
    private router: Router,
    //private flowbiteService: FlowbiteService,
    private messageService: MessageService,
    //public modalService: ModalService,
    public authService: AuthService,
    private readonly confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) { 
    
  }
  /*ngAfterViewInit() {
    this.cd.detectChanges();
  }*/

  
  ngOnInit() {

    //   this.route.paramMap.subscribe(params => {
    //     const idExhortoEnviado = Number(params.get('idExhortoEnviado'));
    //     this.cargarDetallesExhortoEnviado(idExhortoEnviado); // Cargar los detalles de la notifiacion con el idExhortoEnviado
    //     this.getRespuestaExhorto(idExhortoEnviado);//verificar si el exhorto enviado tiene respuesta
    // });

    const state = window.history.state as { idExhortoEnviado: number };

    //console.log('State recibido:', state);

    if (state && state.idExhortoEnviado) {
      this.idExhortoEnviado = state.idExhortoEnviado;
      this.loadDetalles(this.idExhortoEnviado);
      this.getRespuestaExhorto(this.idExhortoEnviado);
      this.cargarActualizacionesDelExhorto();
      this.obtenerMovimientos(this.idExhortoEnviado);
      //console.log(this.listaActualizaciones);

    } else {
      // Si no hay state, redirigir a la lista de amparos
      this.router.navigate(['/inicio/exhortos-enviados']);
    }
    this.GetSeccionesUsuario();
    this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());

  }

  /*ngAfterViewInit(): void {
    this.flowbiteService.initializeFlowbite();
  }*/
  verRespuestasExhorto(){
    //console.log('Navegando hacia respuesta de exhortos enviados', this.idExhortoEnviado)
    this.router.navigate(['/exhortos/respuesta-exhorto-enviado'], {state: {idExhortoEnviado: this.idExhortoEnviado} });

  }

  promoverExhortoEnviado(){
    this.router.navigate(['/exhortos/promocion-exhorto-enviado'], {state: {idExhortoEnviado: this.idExhortoEnviado} });
  }

  async loadDetalles(idExhortoEnviado: number){
    await this.cargarDetallesExhortoEnviado(idExhortoEnviado);
  }

  cargarDetallesExhortoEnviado(idExhortoEnviado: number): Promise<void> {
    return new Promise((resolve, reject)=>{
      //console.log(idExhortoEnviado)
      this.isLoading=true;
      this.cd.detectChanges();
      this.exhortosService.getExhortosEnviadosDetalle(idExhortoEnviado).subscribe({
        next:(response) => {
          //console.log('Datos recibidos:', response);
          setTimeout(() => {
            this.detallesExhortos.set(response.data); // Almacena los datos recibidos en la variable
          
            

            this.detallesExhortosPromocion.set(response.data.promociones);
            
            //console.log('detallesExhortoPromocion: ',this.detallesExhortosPromocion)
            /*if(this.detallesExhortosPromocion()[0].fechaHora == null){
              this.generalesPromocionEnviado=true;
            }
            if(this.detallesExhortosPromocion.fechaRecepcion == null){
              this.archivosPromocionEnviado=true;
            }*/
          });
          //this.cd.detectChanges();
        },
        error:(error) => {
          //console.error('Error al cargar detalle de notificación', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
          this.isLoading=false;
          this.cd.detectChanges();
        },
        complete:()=>{
          this.isLoading=false;
          this.cd.detectChanges();
        }
      });
    });
  }

  //Comprobar si existe una promoción
  getRespuestaExhorto(idExhorto: number) {
    this.exhortosService.getRespuestaExhortoEnviado(idExhorto).subscribe({
      next:(response)=>{
        if(response.success) {

          if(response.data.generales != null || response.data.generales != undefined){
            this.respuesta.push(response.data);
          }
          else{
            this.respuesta.pop();
          }
          if (response.data.generales == undefined) {
            //console.log('Sí existe una promoción', response);
            this.tieneRespuesta = false;
          } else {
            this.tieneRespuesta = true;
          }
        }
        else{
          this.messageService.add({severity:'error',summary: 'Error', detail:response.message});
        }
      },
      error:(e)=>{
        //console.error('Error al recibir el archivo', e);
        this.messageService.add({severity:'error',summary: 'Error', detail:e.message});
      }
    });
  }
  onVerDocumento(fileBase64: string, nombre:string, mime:string): void {
    const file = base64ToFile(fileBase64,nombre, mime);
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      //this.nombre = file.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento.set(true);
    } else {
      console.error('Documento inválido');
    } 
  } 
  
  //Llamada al servicio para obtener los Archivos base64 pdf
  mostrarArchivo(documento: archivoExhortoEnviado, tipoDocumento: number): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.getFile(documento.idArchivo, tipoDocumento).subscribe({
      next: (response) => {
        //console.log("recibe respuesta");
        const base64String = response.data.documento;
         if(documento.tamaño<= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
              
              this.onVerDocumento(base64String,documento.nombreArchivo, 'application/pdf'); // se visualiza en modal
          else{
            const nombre= response.data.fileName;
            this.dialogData.fileName=nombre;
            const ext= nombre.split('.')[1];
            downloadBase64(base64String, nombre,ext );
          }

        //const nombre= response.data.fileName;
        //const ext= nombre.split('.')[1];

        //downloadBase64(base64String, nombre,ext );
        //this.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64String}`);
        //this.visible = true;
      },
      error: (error) => {
        //console.error('Error al recibir el archivo', error);
         this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
         this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }

  editarExhorto() {
    const payload = {
      municipioDestinoId: this.detallesExhortos()?.generales.municipioDestino,
      materiaOrigenId: this.detallesExhortos()?.generales.idMateriaOrigen,
      estadoOrigenId: this.detallesExhortos()?.generales.estadoOrigenId,
      municipioOrigenId: this.detallesExhortos()?.generales.municipioOrigen,
      municipioOrigenTrue: this.detallesExhortos()?.generales.idMunicipioOrigen,
      juzgadoOrigenId: this.detallesExhortos()?.generales.juzgadoOrigenId,
      juzgadoOrigenNombre: this.detallesExhortos()?.generales.juzgadoOrigenNombre,
      numeroExpedienteOrigen: this.detallesExhortos()?.generales.numeroExpedienteOrigen,
      numeroOficioOrigen: this.detallesExhortos()?.generales.numeroOficioOrigen,
      idCatTipoVia: this.detallesExhortos()?.generales.idCatTipoVia,
      tipoJuicioAsuntoDelitos: this.detallesExhortos()?.generales.tipoJuicioAsuntoDelitos,
      juezExhortante: this.detallesExhortos()?.generales.juezExhortante,
      partes: this.detallesExhortos()?.partes,
      fojas: this.detallesExhortos()?.generales.fojas,
      diasResponder: this.detallesExhortos()?.generales.diasResponder,
      tipoDiligenciaId: this.detallesExhortos()?.generales.tipoDiligenciaId,
      tipoDiligenciacionNombre: this.detallesExhortos()?.generales.tipoDiligenciacionNombre,
      observaciones: this.detallesExhortos()?.generales.observaciones,
      idUsuario: this.detallesExhortos()?.generales.idUsuario,
      materiaNombre: this.detallesExhortos()?.generales.materiaNombre,
      estadoDestinoId: this.detallesExhortos()?.generales.estadoDestino,
      promoventes: this.detallesExhortos()?.promoventes,
      idCatMateria: this.detallesExhortos()?.generales.materiaNombreOrigen,
      idExhortoEnviado: this.detallesExhortos()?.generales.idExhortoEnviado, // importante para actualizar
      fechaHora: this.detallesExhortos()?.generales.fechaHora,
      fechaHoraRecepcion: this.detallesExhortos()?.generales.fechaHoraRecepcion,
      numeroExhorto: this.detallesExhortos()?.generales.numeroExhorto,
      idEstatus: this.detallesExhortos()?.generales.idEstatus,
      estatus: this.detallesExhortos()?.generales.estatus
    };
    //console.log('Payload enviado a crear-exhorto:', payload);
    //console.log('Detalles del exhorto:', this.detallesExhortos);
    this.router.navigate(['/exhortos/crear-exhorto'], { state: { datosExhorto: payload, modoEdicion: true } });
  }
  

  filaExpandidaId: number | null = null;

  toggleFilaExpandida(id: number) {
  this.filaExpandidaId = this.filaExpandidaId === id ? null : id;
}


   // Método para redirigir a la vista de promoción
   redirectToPromocion(idExhortoEnviado: number | undefined, idPromocionEnviado: number) {
//    console.log('Navegando a promoción con idNotificacion:', idNotificacion, 'y idRespuesta:', idRespuesta);
    this.router.navigate(['/exhortos/promocion-exhorto-enviado'], {
      state: { idExhortoEnviado, idPromocionEnviado }
    }); 
  }

  /*abrirConfirmacionEnvioPromocionesGenerales(idPromocionEnviado: number) {
    this.idPromocionEnviadoSeleccionado = idPromocionEnviado;
    this.mostrarConfirmacionEnvioGenerales = true;
  }*/
  enviarPromocionGenerales(idPromocionEnviado: number) {
    this.confirmationService.confirm({
      key: 'enviarPromocionGenerales',
      accept: () => this.onEnviarPromocionGenerales(idPromocionEnviado),
      reject: () => { }
    });
  }
  onEnviarPromocionGenerales(idPromocionEnviado: number) {
  if (!idPromocionEnviado) return;
  this.isLoading=true;
  this.cd.detectChanges();
  this.exhortosService.enviarPromocionGenerales(idPromocionEnviado).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Datos generales enviados' });

        if (this.idExhortoEnviado) 
          this.cargarDetallesExhortoEnviado(this.idExhortoEnviado);
        // Actualiza la tabla si es necesario
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message + ' ' + (response.errors == null ? '' : response.errors) });
      }
    },
    error: (e) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
      this.isLoading=false;
      this.cd.detectChanges();
    },
    complete: () => {
      //this.mostrarConfirmacionEnvioGenerales = false;
      //this.idPromocionEnviadoSeleccionado = null;
      this.isLoading=false;
        this.cd.detectChanges();
    }
  });
}

 /*abrirConfirmacionEnvioPromociones(idPromocionEnviado : number){
  if(idPromocionEnviado)
    this.confirmacionEnvioPromociones = true
 }*/
 enviarPromocionArchivos(idPromocionEnviado : number){
  this.confirmationService.confirm({
      key: 'enviarPromocionArchivos',
      accept: () => this.onEnviarPromocionArchivos(idPromocionEnviado),
      reject: () => { }
    });
 }
 onEnviarPromocionArchivos(idPromocionEnviado : number){
  this.isLoading=true;
  this.cd.detectChanges();
  this.exhortosService.enviarPromocionArchivos(idPromocionEnviado).subscribe({
      next: (response:any) => {
        if(response.success){

          this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Promoción enviado' });
          this.archivoRecibidoPromocionConAcuse=response.data;
          //this.modalService.open('modal2');
          // Aquí podrías actualizar la lista de documentos si es necesario
          if (this.idExhortoEnviado) 
            this.cargarDetallesExhortoEnviado(this.idExhortoEnviado);
        }
        else{
          this.messageService.add({severity:'error',summary: 'Error', detail:response.message +' '+ (response.errors == null ? '' : response.errors)});
        }

      },
      error:(e)=>{
        //console.error('Error al recibir el archivo', e);
        this.messageService.add({severity:'error',summary: 'Error', detail:e.message});
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        //console.log('FIN:');
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });

   // this.modalService.open('modal2');
   //this.confirmacionEnvioPromociones = false
 }

cargarActualizacionesDelExhorto()
  {
    if(this.idExhortoEnviado!== undefined)
    {
      this.exhortosService.getActualizacionesExhortoEnviado(this.idExhortoEnviado!).subscribe({
        next:(response:GenericResponse<actualizacionesExhortoEnviado[]>) => {
          if(response.success)
          {
                this.listaActualizaciones= response.data;

          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
          }

        },
        error:(e)=>{
            //console.error('Error en la petición eliminar:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          },
          complete:()=>{
            //console.log('FIN:');
          }
      });
    }
  }

   obtenerMovimientos(idExhortoEnviado: number) {
    this.exhortosService.getMovimientosExhortoEnviado(idExhortoEnviado).subscribe({
        next:(response => {
            //console.log('Datos recibidos:', response);
            this.movimientos.set(response.data); // Almacena los datos recibidos en la variable
          }),
        error:(error) => {
            //console.error('Error al cargar los movimientos del exhorto', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        }
    });
  }

   pdf(){
    const newObject: detalleExhortosEnviados | null = this.detallesExhortos();

    generateExEnviadosPDF(newObject as detalleExhortosEnviados, this.respuesta, this.listaActualizaciones);
  }

  selectClass(estatus: string | undefined){
    if(estatus === 'Respondido'){
      return 'bg-lime-600/50'
    }else if(estatus === "Pendiente de enviar"){
      return 'bg-orange-400/50'
    }else if(estatus === "Enviado"){
      return 'bg-violeta/50'
    }else{
      return 'bg-blue-300/50'
    }

  }

  GetSeccionesUsuario(): Promise<void>{
    return new Promise((resolve, reject) => {
    const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
    const perfilSeleccionado = this.authService.getPerfilSeleccionado();
    //const idAreaSistemaUsuario = localStorage.getItem('idAreaSistemaUsuario');
    //const perfilSeleccionado = localStorage.getItem('perfilSeleccionado');
    this.authService.GetSeccionesUsuario(idAreaSistemaUsuario,this.idPantalla.toString(),perfilSeleccionado)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.secciones = res.data;
                if(this.secciones === null || this.secciones === undefined){
                  setTimeout(() => {
                    this.tienePermisoPromover.set(false);
                    this.tienePermisoVerRespuesta.set(false);
                    this.tienePermisoEditarExhorto.set(false);
                    this.tienePermisoPromocionEditar.set(false);
                    this.tienePermisoPromocionEnviarGenerales.set(false);
                    this.tienePermisoPromocionEnviarArchivos.set(false);
                   
                  });
                }
                else if(this.secciones.length > 0 ){
                  setTimeout(() => {
                    this.tienePermisoPromover.set(this.secciones.some(s => s.descripcion === 'Promover'));
                    this.tienePermisoVerRespuesta.set(this.secciones.some(s => s.descripcion === 'VerRespuesta'));
                    this.tienePermisoEditarExhorto.set(this.secciones.some(s => s.descripcion === 'EditarExhorto'));
                    this.tienePermisoPromocionEditar.set(this.secciones.some(s => s.descripcion === 'PromocionEditar'));
                    this.tienePermisoPromocionEnviarGenerales.set(this.secciones.some(s => s.descripcion === 'PromocionEnviarGenerales'));
                    this.tienePermisoPromocionEnviarArchivos.set(this.secciones.some(s => s.descripcion === 'CargarPromocionEnviarArchivosArchivo'));
                  });
                }
               //this.cd.detectChanges();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error en la respuesta del servidor." });
          }
          
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
          
        }
      });
      });
  }
}
