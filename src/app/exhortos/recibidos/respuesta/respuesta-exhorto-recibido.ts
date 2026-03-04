import { ChangeDetectorRef, Component, inject, signal, Signal } from '@angular/core';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { archivos, EnviadoRespuestaArchivosResponse, respuestaExhorto } from '../../interfaces/exhortos.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { AuthService } from '../../../core/auth/service/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ExhortosService } from '../../services/exhorto.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { base64ToFile, downloadBase64 } from '../../../shared/functions/utils';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Dialog } from "primeng/dialog";
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-respuestaExhortoRecibido',
  imports: [PdfDialog, TableModule, Button, CommonModule, Breadcrub, Spinner, ConfirmDialog, Dialog, Toast],
  templateUrl: './respuesta-exhorto-recibido.html',
  styleUrl: './respuesta-exhorto-recibido.css',
  providers: [MessageService,ConfirmationService]
})
export class RespuestaExhortoRecibido {
  detallesAcuerdo!: respuestaExhorto;
  expandedRows: { [key: number]: boolean } = {};
  idExhorto: any;
  visible: boolean = false;
  fileContent: SafeResourceUrl | undefined;
  statuses!: any[];
  idNotificacion: any;
  isLoading: boolean = false;
  generalesEnviado =false;
  archivosEnviado =false;
  envioDialog: boolean = false;
  //confirmacionEliminar = false;
  //confirmacionEnvio = false;
  //confirmacionEnvioArchivos = false;

  idArchivo: number = 0;
  documento: any = {}; // Asegúrate de inicializar esto según tu contexto.
  base64String!:String;

  //Asignamos el id pantalla
  idPantalla=14216;
  //Obtenemos las secciones de la pantalla actual
  secciones : secciones[] = [] ;
  responseSecciones!: GenericResponse<secciones[]>;

  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoEditar= signal<boolean>(false);
  tienePermisoEnviarGenerales = signal<boolean>(false);
  tienePermisoEnviarArchivos= signal<boolean>(false);
  tienePermisoEliminarArchivo =signal<boolean>(false);
  puedeEnviarGenerales= signal<boolean>(false);
  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado! : Signal<string>;
  enviadoRespuestaArchivosResponse! : EnviadoRespuestaArchivosResponse ;

  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo

  constructor(
      private messageService: MessageService,
      private exhortosService: ExhortosService,
      //private route: ActivatedRoute,
      private cd: ChangeDetectorRef,
      private sanitizer: DomSanitizer,
      private confirmationService: ConfirmationService,
      private router: Router,
      //public modalService : ModalService,
      private authService: AuthService

    ){}
  ngOnInit() {
    const state = window.history.state as { idExhortoRecibido: number };
    if (state && state.idExhortoRecibido) {
      this.idNotificacion = state.idExhortoRecibido;
      this.cargarDetallesPromocion(this.idNotificacion); // Cargar los detalles de la notifiacion con el idNotificacion


    } else {
      // Si no hay state, redirigir a la lista de amparos
      this.router.navigate(['/inicio/promocion']);
    }
   
    this.GetSeccionesUsuario();
    this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());
  }
  onRowExpand(event: any): void {
    this.expandedRows[event.data.idRespuesta] = true;
  }
  onRowCollapse(event: any): void {
    delete this.expandedRows[event.data.idRespuesta];
  }

  // Método para redirigir a la vista de promoción
  generarAcuerdo(idExhortoRecibido: number, idRespuesta: number) {
    //console.log('Navegando a promoción con idNotificacion:', idExhortoRecibido, 'y idRespuesta:', idRespuesta);
    this.router.navigate(['/exhortos/generar-acuerdo'], {
      state: { idExhortoRecibido, idRespuesta }
    });
  }
  enviarAcuerdoGenerales(idExhortoRecibido: number) {
    this.confirmationService.confirm({
      key: 'enviarGenerales',
      accept: () => this.onEnviarAcuerdoGenerales(idExhortoRecibido),
      reject: () => { }
    });
  }
  onEnviarAcuerdoGenerales(idExhortoRecibido: number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.enviarRespuestaGenerales(idExhortoRecibido).subscribe({
      next: (response:any) => {
        if(response.success){

          this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Respuesta enviada' });
          this.generalesEnviado=true;

          // Aquí podrías actualizar la lista de documentos si es necesario
        }
        else{
          this.messageService.add({severity:'error',summary: 'Error', detail:response.message});
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

    
  }
  enviarAcuerdoArchivos(idExhortoRecibido: number) {
    this.confirmationService.confirm({
      key: 'enviarArchivos',
      accept: () => this.onEnviarAcuerdoArchivos(idExhortoRecibido),
      reject: () => { }
    });
  }
  onEnviarAcuerdoArchivos(idExhortoRecibido: number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.enviarRespuestaArchivos(idExhortoRecibido).subscribe({
      next: (response:any) => {
        if(response.success){

          this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Archivos enviados' });
          this.archivosEnviado=true;
          this.enviadoRespuestaArchivosResponse = response.data;
          this.envioDialog = true;
          //this.modalService.open('modal2');
          // Aquí podrías actualizar la lista de documentos si es necesario
        }
        else{
          this.messageService.add({severity:'error',summary: 'Error', detail:response.message});
        }

        this.cargarDetallesPromocion(idExhortoRecibido);

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
    
    //this.modalService.open('modal2');
  }
  cargarDetallesPromocion(idNotificacion: number): void {
    this.idNotificacion = idNotificacion; // Almacena el idNotificacion
    this.isLoading = true;
    this.exhortosService.getRespuestaExhortoRecibido(idNotificacion).subscribe({
      next: (response => {
        if(response.success){
          this.isLoading = false;
          this.detallesAcuerdo = response.data;
          if(this.detallesAcuerdo.generales.fechaHora!=null){
            this.generalesEnviado=true;
            if(this.detallesAcuerdo.generales.fechaHoraRecepcion!=null){
              this.archivosEnviado=true;
            }
          }
          if(this.detallesAcuerdo.archivos.length>0)
          {
            // Buscar si existe un archivo con idTipoDocumento = 2
            const archivoTipo2 = this.detallesAcuerdo.archivos.find(a => a.idTipoDocumento === 2);

            // Validar que ese archivo tenga exactamente dos firmantes
            const tieneDosFirmas = archivoTipo2?.firmantes?.length === 2;
            // se puede empezar enviar la respuesta con la condicion de que:
            // se debe tener un documento de tipo=2 Acuerdo
            // el documento de tipo 2 debe tener al menos dos firmas: del secretario y del juez
            this.puedeEnviarGenerales.set(tieneDosFirmas);
          }
          //console.log(this.detallesAcuerdo);
          //this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
        }
        else{
          //console.log(response.errors);
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
        }
      }),
      error: (e) => {
        //console.error('Error al cargar detalle de promoción', error);
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: e.message });
        this.isLoading = false;
      }
    });
  }
    //Llamada al servicio para obtener los Archivos base64 pdf
  mostrarArchivo(documento: archivos, tipoDocumento: number): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.getFile(documento.idArchivo, tipoDocumento).subscribe({
      next: (response) => {
        //console.log("recibe respuesta");
        if(response.success){
          const base64String = response.data.documento;
          if((documento.tamanio ?? 0) <= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
              
              this.onVerDocumento(base64String,documento.nombreArchivo ?? 'sinnombre', 'application/pdf'); // se visualiza en modal
          else{
            const nombre= response.data.fileName;
            this.dialogData.fileName=nombre;
            const ext= nombre.split('.')[1];
            downloadBase64(base64String, nombre,ext );
          }
        }
        else
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
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
  eliminarDocumento(idArchivo: number) {
    this.confirmationService.confirm({
      key: 'eliminarArchivos',
      accept: () => this.onEliminarDocumento(idArchivo),
      reject: () => { }
    });
  }
  onEliminarDocumento( idArchivo: number) {
    const tipo = 1; // Puedes cambiar este valor según sea necesario
    this.exhortosService.eliminarArchivo(idArchivo, tipo).subscribe({
      next:(response)=>{
        if(response.success){
          /*this.detallesAcuerdo.forEach(promocion => {
            //promocion.archivos = promocion.archivos.filter(archivo => archivo.idArchivo !== idArchivo);
          });*/
          // Encuentra el índice del documento que quieres eliminar
              this.cargarDetallesPromocion(this.idNotificacion);
          this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Documento eliminado exitosamente' });
          // Aquí podrías actualizar la lista de documentos si es necesario
        }
        else{
          this.messageService.add({ severity: 'error', summary: 'Surgió un error', detail: response.message +'\n'+ response.errors });
        }
      },
      error: (e)=> {
          //console.error('Error al eliminar el documento', error);
          this.messageService.add({ severity: 'error', summary: 'Surgió un error', detail: e.message });
        }
      
      });
      
  }
  GetSeccionesUsuario(): Promise<void>{
    return new Promise((resolve, reject) => {
      const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
      const perfilSeleccionado = this.authService.getPerfilSeleccionado();
      //const perfilSeleccionado = localStorage.getItem('perfilSeleccionado');
      //const idAreaSistemaUsuario = localStorage.getItem('idAreaSistemaUsuario');
    this.isLoading=true;
    this.cd.detectChanges();
    this.authService.GetSeccionesUsuario(idAreaSistemaUsuario,this.idPantalla.toString(),perfilSeleccionado)
      .subscribe({
        next: (res) => {
          if (res.success) {
             this.secciones = res.data;
            this.tienePermisoEditar.set(this.secciones.some(s => s.descripcion === 'Editar'));
            this.tienePermisoEnviarGenerales.set(this.secciones.some(s => s.descripcion === 'EnviarGenerales'));
            this.tienePermisoEnviarArchivos.set(this.secciones.some(s => s.descripcion === 'EnviarArchivos'));
            this.tienePermisoEliminarArchivo.set(this.secciones.some(s => s.descripcion === 'EliminarArchivo'));
                  

          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error en la respuesta del servidor." });
          }
        },
        error: (err) => {
          
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
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
  hideDialogAcuse() {
    this.envioDialog = false;
  }
}
