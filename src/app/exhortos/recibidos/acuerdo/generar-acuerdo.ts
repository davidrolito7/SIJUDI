import { ChangeDetectorRef, Component, inject, Signal, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/service/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {SelectModule} from 'primeng/select';
import { TextareaModule} from 'primeng/textarea';
import {InputTextModule} from 'primeng/inputtext';
import { ExhortosService } from '../../services/exhorto.service';
import { TokenService } from '../../../core/auth/service/token.service';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { archivos, EnviadoRespuestaArchivosResponse, generales, guardaExhortoRespuesta, ListadoCatalogoTipoDiligenciado, ListadoCatalogoTipoDocumento, ListadoExhortosRecibidosI, respuestaExhorto } from '../../interfaces/exhortos.model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { QrService} from '../../../shared/services/qr.service';
import ValidateForm from '../../../helpers/validateform';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { Button } from "primeng/button";
import { FileSelectEvent, FileUpload } from "primeng/fileupload";
import { TableModule } from "primeng/table";
import { base64ToFile, downloadBase64, downloadFile, validaPdf } from '../../../shared/functions/utils';
import {validarFirmasUsuario} from '../../functions/firmas';
import { DialogModule } from "primeng/dialog";
import { InputIconModule } from "primeng/inputicon";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-GenerarAcuerdo',
  imports: [ConfirmDialog, Breadcrub, Spinner, CommonModule, FormsModule, ReactiveFormsModule, SelectModule, TextareaModule, PdfDialog, Button, FileUpload, TableModule, DialogModule, InputIconModule, ConfirmDialogModule, ToastModule,InputTextModule],
  templateUrl: './generar-acuerdo.html',
  styleUrl: './generar-acuerdo.css',
  providers: [MessageService,ConfirmationService]
})
export class GenerarAcuerdo {
  tienePermisoActualizar  = signal<boolean>(false);
  tienePermisoGuardar = signal<boolean>(false);
  tienePermisoEnviarGenerales = signal<boolean>(false);
  tienePermisoEnviarArchvios = signal<boolean>(false);
  tienePermisoSeleccionarArchivo = signal<boolean>(false);
  tienePermisoCargarArchivo = signal<boolean>(false);
  tienePermisoFirmarArchivo = signal<boolean>(false);
  tienePermisoEliminarArchivo = signal<boolean>(false);

  listadoTipoDiligenciado = signal<ListadoCatalogoTipoDiligenciado[]>([]);
  listadoTipoDocumento = signal<ListadoCatalogoTipoDocumento[]>([]);
  listaDocumentos=signal<archivos[]>([]);
  datosExhortoRecibido! : ListadoExhortosRecibidosI;
  acuseEnviarAcuerdoArchivos! : EnviadoRespuestaArchivosResponse;
  detallesAcuerdo =signal<respuestaExhorto>(<respuestaExhorto>{});
  puedeEnviarGenerales = signal<boolean>(false);
  //acuerdo!: generales; 
  //responseRespuestaExhortos!: GenericResponse<respuestaExhorto>;

  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado! : Signal<string>;
  idExhortoRecibido: number =0;
  idRespuesta: number=0;
  //idEstatusRespuesta: number=0;

  //Se declaran las variables para la visualizacion de las secciones
  secciones : secciones[] = [] ;
  //Asignar el id de la pantalla, para poder obtener las secciones(permisos) de esta pantalla
  idPantalla=14158;
  isLoading: boolean = false;
  firmaDialog: boolean=false;
   dialogData: any = {}; // Para almacenar la información del archivo del diálogo

  uploadedFiles: any[] = [];
  nombreDocumento: string = '';
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  seleccionadosParaFirma = signal(false);

  acuerdosForm = new FormGroup({
      tipoDiligenciado: new FormControl(null as ListadoCatalogoTipoDiligenciado | null, Validators.required),
      observaciones: new FormControl('')
    });
  doctosForm= new FormGroup({
    tipoDocumento: new FormControl(null as ListadoCatalogoTipoDocumento | null,Validators.required),
  });
  formularioFirma = new FormGroup({
    password: new FormControl('', Validators.required),
    file_pfx: new FormControl(''),

  });
 
   showPassword: boolean = false;

  constructor(
    //private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer,
    private exhortosService: ExhortosService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private tokenService : TokenService,
    //public modalService : ModalService,
    private qrService : QrService,
    public authService: AuthService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef,

  ) {}
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const paramId = params.get('idExhortoRecibido');
      const state = window.history.state as { idExhortoRecibido?: number };
      const idExhorto = paramId ? +paramId : state?.idExhortoRecibido;

      if (!idExhorto) {
        this.router.navigate(['/exhortos/detalles-exhorto-recibido']);
        return;
      }

      this.idExhortoRecibido = idExhorto;
     

      // Cargar datos
      this.getListadoTipoDiligenciado().then(()=>{
        this.verRespuestaExhortoRecibido(this.idExhortoRecibido);
      });

      this.getListadoTipoDocumento();
      this.getdatosExhortoRecibido(this.idExhortoRecibido);

      this.GetSeccionesUsuario();
      this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());

    });
  }
  getListadoTipoDiligenciado():Promise<void> {
    return new Promise((resolve, reject) => {
      this.exhortosService.getCatalogoTipoDiligenciado().subscribe({
        next:(responseTipoDiligenciado: GenericResponse<ListadoCatalogoTipoDiligenciado[]>) => {
          if(responseTipoDiligenciado.success){
            //console.log(responseTipoDiligenciado); // Verifica la estructura aquí
            this.listadoTipoDiligenciado.set(responseTipoDiligenciado.data); // Asigna los datos al dropdown
            resolve();
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: responseTipoDiligenciado.message });
          }
        },
        error:(e) => {
          //console.error('Error al cargar los tipos de diligenciado', e.message);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          reject(e);
        }
      });
    })
  }
  getListadoTipoDocumento(): void{
    this.exhortosService.getCatalogoTipoDocumento().subscribe({
      next:(responseTipoDocumento: GenericResponse<ListadoCatalogoTipoDocumento[]>) =>{
        if(responseTipoDocumento.success){
          //console.log(responseTipoDocumento);
          this.listadoTipoDocumento.set(responseTipoDocumento.data);
        }
        else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: responseTipoDocumento.message });
        }
      },
      error:(e) => {
        //console.log("Error al cargar los tipos de documentos", e.message);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
      }
    });
  }
  getdatosExhortoRecibido(idExhortoRecibido : number ){
  this.isLoading = true;
  this.cd.detectChanges();
      this.exhortosService.getExhortosRecibidosDetalle(idExhortoRecibido).subscribe({
        next: (response => {
          if(response.success){
            this.isLoading = false;
            this.cd.detectChanges();
            this.datosExhortoRecibido = response.data.generales;


            //this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          }
          else{
            //console.log(response.errors);
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${ response.errors==undefined ? "" : response.errors.join(", ")}` });
          }
        }),
        error: (error) => {
          //console.error('Error al cargar detalle de promoción', error);
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
  }
  //ver respuesta de exhorto recibido
  verRespuestaExhortoRecibido(idExhortoRecibido: number){
    this.exhortosService.getRespuestaExhortoRecibido(idExhortoRecibido).subscribe({
      next:(response: GenericResponse<respuestaExhorto>) => {
        //console.log('Respuesta de exhorto recibido', responseRespuestaExhortos); // Verificar la estructura aquí
        if (response && response.success) {
          //Verifica si responseRespuestaExhortos.data tiene la estructura esperada
          if (response.data) {
            this.detallesAcuerdo.set(response.data);
            //Asigna los valores al formulario
            this.acuerdosForm.patchValue({
              observaciones: response.data.generales?.observaciones || '',
              tipoDiligenciado: this.listadoTipoDiligenciado().find(item => item.idTipoDiligenciado === response.data.generales?.idTipoDiligenciado) || null
            });

            if(response.data.generales != null){
              this.idRespuesta = response.data.generales.idRespuesta;
            }

            if (response.data.archivos.length > 0) {
              //obtenemos el idUsuario del token
              const userData = this.tokenService.getUserFromToken();
              var idUsuario=0;
              if(userData !== null){
                idUsuario = userData.idGeneral;
              }
              const documentosValidados = validarFirmasUsuario(response.data.archivos,idUsuario);
              this.listaDocumentos.set(documentosValidados);

              // Buscar si existe un archivo con idTipoDocumento = 2
              const archivoTipo2 = this.listaDocumentos().find(a => a.idTipoDocumento === 2);

              // Validar que ese archivo tenga exactamente dos firmantes
              const tieneDosFirmas = archivoTipo2?.firmantes?.length === 2;
              // se puede empezar enviar la respuesta con la condicion de que:
              // se debe tener un documento de tipo=2 Acuerdo
              // el documento de tipo 2 debe tener al menos dos firmas: del secretario y del juez
              this.puedeEnviarGenerales.set(tieneDosFirmas);
                //this.puedeEnviarGenerales.set(this.listaDocumentos().some(doc => doc.idTipoDocumento==2));
                /*this.listaDocumentos.set(response.data.archivos.map((archivo: any) => ({
                  ...archivo
                })));*/
              
            } else {
              this.puedeEnviarGenerales.set(false);
              this.listaDocumentos.set([]);
              this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontraron documentos asociados al exhorto.'
              });
            }
          } else {
            //console.warn('La respuesta no contiene datos.');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La respuesta no contiene datos.' });
          }
        } else {
          //console.warn('La respuesta fue incorrecta');
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error:(e) => {
        //console.error('Error al cargar respuesta de exhorto', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
      }
    });
    //console.log(this.listadoTipoDiligenciado);
  }
  // Confirmación para guardar datos generales de la respuesta
  /*confirm() {
    
        // Acciones en caso de aceptación
        //const idTipoDiligenciado =this.selectedTipoDiligenciado.idTipoDiligenciado;
        if(this.selectedTipoDiligenciado !== undefined)
        {
          
          this.guardarRespuestaExhorto(1, this.idExhortoRecibido, this.observacionesGuardadas == undefined ? '' : this.observacionesGuardadas);
          this.getdatosExhortoRecibido(this.idExhortoRecibido);
        }
        else
        {
           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar un tipo de diligencia' });
        }

  }*/
   guardarRespuestaExhorto() {
    this.confirmationService.confirm({
      key: 'guardarAcuerdo',
      accept: () => this.onGuardarRespuestaExhorto(),
      reject: () => { }
    });
  }
  //Guardar respuesta exhorto.
  onGuardarRespuestaExhorto(){
    if(!this.acuerdosForm.valid){
      // datos generales
      this.acuerdosForm.markAllAsTouched();
      this.acuerdosForm.updateValueAndValidity();
      ValidateForm.validateAllFormFields(this.acuerdosForm);
            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' });
      return;
    }
    //obtenemos el idUsuario del token
    const userData = this.tokenService.getUserFromToken();
    var idUsuario=0;
    if(userData !== null){
       idUsuario = userData.idGeneral;
    }
    if(this.idRespuesta && this.idRespuesta > 0){
      this.actualizarRespuestaExhorto(this.idRespuesta);
    }else{

      this.isLoading = true;
      this.cd.detectChanges();
      this.exhortosService.setRespuestaExhorto(idUsuario, this.idExhortoRecibido,  Number(this.acuerdosForm.value.tipoDiligenciado?.idTipoDiligenciado), this.acuerdosForm.value.observaciones ?? null)
      .subscribe({
        next:(response: GenericResponse<generales>) => {
        //response  => {
          if(response.success){
            //console.log("Guardao");
            //this.idRespuesta=Number(response.data.idRespuesta);
            //this.acuerdo=response.data;
            this.detallesAcuerdo().generales = response.data;
            //asignamos los valores devueltos al formulario
            this.acuerdosForm.patchValue({
              tipoDiligenciado: this.listadoTipoDiligenciado().find(item => item.idTipoDiligenciado === this.detallesAcuerdo().generales.idTipoDiligenciado) || null,
              observaciones: this.detallesAcuerdo().generales.observaciones || ''
            });
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Respuesta guardada.' });
          }else{
            //console.log("No se pudo guardar la respuesta.", response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors[0] });
          }

        },
        error:(e) => {
            //console.error('Error en la petición guardar:', e.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
            this.isLoading = false;
            this.cd.detectChanges();
        },
        complete:()=>{
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    }
  }
  //Actualizar la respuesta del exhorto
  actualizarRespuestaExhorto(idRespuesta:number){
      this.isLoading = true;
      this.cd.detectChanges();
      this.exhortosService.updateRespuestaExhorto(idRespuesta, this.acuerdosForm.value.observaciones ?? null,this.acuerdosForm.value.tipoDiligenciado?.idTipoDiligenciado ?? 0)
      .subscribe({
        next: (response: any) => {
          if(response.success) 
          {
            //console.log("Datos actulizados: ",response);
            this.verRespuestaExhortoRecibido(this.idExhortoRecibido);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Respuesta actualizada.' });
          }
        },
        error:(e)=>{
          //console.log("Error en la petición actualizar: ", error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          this.isLoading = false;
          this.cd.detectChanges();
        },
        complete:()=>{
          this.isLoading = false;
          this.cd.detectChanges();
        }
    });

  }
  enviarAcuerdoGenerales(idExhortoRecibido: number){
    //console.log('Envio de datos generales', idExhortoRecibido);
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.enviarRespuestaGenerales(idExhortoRecibido).subscribe({
      next: (response:any) => {
        if(response.success){
          //this.mostrarBotonGuardar = false;
          //this.mostrarBotonActualizar=false;
          //this.mostrarBotonEnviarGenerales = false;
          //this.mostrarBotonEnviarArchivos = true;
          this.detallesAcuerdo().generales.idEstatus = 12; // en proceso de envío
          this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Respuesta enviada' });
          //this.generalesEnviado=true;
          // Aquí podrías actualizar la lista de documentos si es necesario
        }
        else{
          this.messageService.add({severity:'error',summary: 'Error', detail:`${response.message}\n${ response.errors == undefined ? "": response.errors.join(", ")}`});
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
  enviarAcuerdoArchivos(idExhortoRecibido: number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.enviarRespuestaArchivos(idExhortoRecibido).subscribe({
      next: (response:any) => {
        if(response.success){
          //this.mostrarBotonEnviarArchivos = false;
          this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Archivos enviados' });
          //this.archivosEnviado=true;
          
          this.acuseEnviarAcuerdoArchivos=response.data;
          this.detallesAcuerdo().generales.idEstatus = 13; // respuesta enviada completamente
            //this.sendQRData();
            //this.modalService.open('modal2');
          // Aquí podrías actualizar la lista de documentos si es necesario
        }
        else{
          this.messageService.add({severity:'error',summary: 'Error', detail:`${response.message}\n${ response.errors == undefined ? "": response.errors.join(", ")}`});
        }

        //this.cargarDetallesAcuerdo(idExhortoRecibido);
        this.verRespuestaExhortoRecibido(idExhortoRecibido);

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

  /*cargarDetallesAcuerdo(idNotificacion: number): void {
      //this.idNotificacion = idNotificacion; // Almacena el idNotificacion
      this.isLoading = true;
      this.cd.detectChanges();
      this.exhortosService.getRespuestaExhortoRecibido(idNotificacion).subscribe({
        next: (response => {
          if(response.success){
            this.isLoading = false;
            this.cd.detectChanges();
            this.detallesAcuerdo = response.data;
            if(this.detallesAcuerdo.generales.fechaHora!=null){
              //this.generalesEnviado=true;
              if(this.detallesAcuerdo.generales.fechaHoraRecepcion!=null){
                //this.archivosEnviado=true;
              }
            }
            //console.log(this.detallesAcuerdo);
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          }
          else{
            //console.log(response.errors);
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${ response.errors==undefined ? "" : response.errors.join(", ")}`});
          }
        }),
        error: (e) => {
          //console.error('Error al cargar detalle de promoción', error);
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: e.message });
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
  }*/

  /*sendQRData() {
    this.qrService.updateQRData(this.urlInfo); // Envía datos al servicio
  }*/
 
  GetSeccionesUsuario(): Promise<void> {
    return new Promise((resolve, reject) => {
      
      const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
      const perfilSeleccionado = this.authService.getPerfilSeleccionado();

      //const idAreaSistemaUsuario = getStorageValue('idAreaSistemaUsuario');
      //const perfilSeleccionado = getStorageValue('perfilSeleccionado'); 
      this.authService.GetSeccionesUsuario(idAreaSistemaUsuario, this.idPantalla.toString(), perfilSeleccionado)
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.secciones = res.data;
              if (this.secciones === null || this.secciones === undefined) {
                this.tienePermisoGuardar.set(false);
                this.tienePermisoEnviarGenerales.set(false);
                this.tienePermisoEnviarArchvios.set(false);
                this.tienePermisoSeleccionarArchivo.set(false);
                this.tienePermisoCargarArchivo.set(false);
                this.tienePermisoFirmarArchivo.set(false);
                this.tienePermisoEliminarArchivo.set(false);

              }
              else if (this.secciones.length > 0) {
                this.tienePermisoGuardar.set(this.secciones.some(s => s.descripcion === 'Guardar'));
                this.tienePermisoEnviarGenerales.set(this.secciones.some(s => s.descripcion === 'EnviarGenerales'));
                this.tienePermisoEnviarArchvios.set(this.secciones.some(s => s.descripcion === 'EnviarArchivos'));
                this.tienePermisoSeleccionarArchivo.set(this.secciones.some(s => s.descripcion === 'SeleccionarArchivo'));
                this.tienePermisoCargarArchivo.set(this.secciones.some(s => s.descripcion === 'CargarArchivo'));
                this.tienePermisoFirmarArchivo.set(this.secciones.some(s => s.descripcion === 'FirmarArchivo'));
                this.tienePermisoEliminarArchivo.set(this.secciones.some(s => s.descripcion === 'EliminarArchivo'));

              }
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
  onAnexosSelect(event: FileSelectEvent) {
    // Agregar archivos seleccionados a la lista local de documentos con valores por defecto
    if (!event || !event.files || event.files.length === 0) return;

    for (const file of event.files) {
      if(!validaPdf(file))
      {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: "El archivo no es un pdf"});
          return;
      }

      const nuevo: archivos = {
        idArchivo: 0,
        idExhortoRecibido: this.idExhortoRecibido ?? 0,
        nombreArchivo: file.name,
        hashSha1: '',
        hashSha256: '',
        idTipoDocumento: 0,
        tipoDocumento: { idTipoDocumento: 0, nombre: '', activo: false },
        tamanio: file.size ?? 0,
        paginas: 0,
        recibido: false,
        idClasificacionArchivo: 0,
        ruta: '',
        firmado: false,
        fechaFirmado: null as any,
        activo: true,
        selecParaFirma: false,
        firmantes: [],
        file:file,
        usrYaFirmo:false
      };

      // Añadir campo auxiliar `tam` que se usa en otras partes del componente
      // @ts-ignore
      nuevo.tam = file.size ?? 0;

      this.listaDocumentos().push(nuevo);
    }
  }
  archivo_seleccionado(item: any) {
    item.selecParaFirma = !item.selecParaFirma;

    //ponemos un señal para saber cuando se haya seleccionado al menos una fila para firmar
    //Verifica si al menos un archivo está seleccionado
    const algunoSeleccionado = this.listaDocumentos().some(a => a.selecParaFirma);
    this.seleccionadosParaFirma.set(algunoSeleccionado);
  }
  eliminarFirma(idFirmaTmp: number, idArchivo: number) {
    this.exhortosService.eliminarUnaFirma(idFirmaTmp).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Encuentra el índice del documento que quieres eliminar
          const index = this.listaDocumentos().findIndex(doc => doc.idArchivo === idArchivo);
          if (index !== -1) {
            const indexFirmas = this.listaDocumentos()[index].firmantes.findIndex(f => f.idFirmaTmp == idFirmaTmp);
            if (indexFirmas !== -1) {
              // Elimina el elemento del arreglo
              this.listaDocumentos()[index].firmantes.splice(indexFirmas, 1);
              //obtenemos el idUsuario del token
              const userData = this.tokenService.getUserFromToken();
              var idUsuario=0;
              if(userData !== null){
                idUsuario = userData.idGeneral;
              }
              const documentosValidados = validarFirmasUsuario(this.listaDocumentos(),idUsuario);
              this.listaDocumentos.set(documentosValidados);

            }
          }
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
        }
        else {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message });
      },
      complete: () => {

      }
    });
  }
  onUpload(file: File) {
      if (this.doctosForm.valid) {
  
       // for (let file of event.files) {
          this.uploadedFiles.push(file);
          this.nombreDocumento = file.name;  // Establece el nombre del documento
          this.guardarDocumento(file);  // Llama a guardarDocumento para cada archivo subido
          //this.progressValue = 0; // Restablece el progreso al final de la carga
          // this.messageService.add({ severity: 'info', summary: 'Archivo cargado', detail: '' });
        }
      //}
      else {
        ValidateForm.validateAllFormFields(this.doctosForm);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo documento requerido' })
      }
  
  }
  //Guardar Documento seleccionado
  guardarDocumento(file: File) {
    const tipoDocId = Number(this.doctosForm.value.tipoDocumento?.idTipoDocumento);

    if (!tipoDocId || tipoDocId === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un tipo de documento' });
      return;
    }

    const tipoSeleccionado = this.listadoTipoDocumento().find(doc => doc.idTipoDocumento === tipoDocId);
    if (!tipoSeleccionado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo de documento inválido' });
      return;
    }

    //this.selectedTipoDocumento = tipoSeleccionado;
    if (!this.idExhortoRecibido) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se ha recibido idExhorto' });
      return;
    }

    const formData = new FormData();
    formData.append('archivo', file, file.name);
    formData.append('idExhortoRecibido', this.idExhortoRecibido.toString());
    formData.append('tipoDocumento', tipoSeleccionado.idTipoDocumento.toString());
    const Usuario = this.tokenService.getUserFromToken();
    formData.append('idUsuario', Usuario.idGeneral);

    //console.log('Datos enviados al backend:', formData);

    this.exhortosService.setDocumento(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Archivo guardado:', response.data);
          this.verRespuestaExhortoRecibido(this.idExhortoRecibido); // Actualiza los detalles del acuerdo para reflejar el nuevo documento
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento guardado exitosamente' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
          this.nombreDocumento = ''; // Restablece el nombre del documento en caso de error
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el documento' });
      }
    });
  }
  aplicarFirmas(idArchivo:number) {
    this.confirmationService.confirm({
      key: 'aplicarFirmas',
      accept: () => this.onAplicarFirmas(idArchivo),
      reject: () => { }
    });
  }
  onAplicarFirmas(idArchivo:number){
    this.isLoading=true;
    this.cd.detectChanges;
    this.exhortosService.aplicarFirmasAcuerdo(idArchivo).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          this.verRespuestaExhortoRecibido(this.idExhortoRecibido);
        } else {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message });
        this.isLoading=false;
        this.cd.detectChanges;
      },
      complete:()=>{
        //this.confirmacionAplicarFirmas=false;
        this.isLoading=false;
        this.cd.detectChanges;
      }
    });
  }
  getFile(documento: archivos, tipoDocumento: number): void {
      const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
      if(documento.idArchivo ==0) // son archivos que no se han guardado
      {
        if(documento.tamanio<= FIVE_MB && documento.nombreArchivo.split('.')[1]==='pdf')
          this.onVerDocumentoFile(documento.file); // se visualiza en modal
        else
        { 
          downloadFile(documento.file); // se descarga
        }
           
        
      }
      else{ // aqui ya son archivos guardados
        this.isLoading=true;
        this.cd.detectChanges();
        this.exhortosService.getFile(documento.idArchivo,tipoDocumento).subscribe({
          next: (response:any) => {
  
          if (response.success) {
            const fileData = response.data.documento;
            //console.log(fileData);
              if(documento.tamanio<= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
                this.onVerDocumentoBase64(fileData,documento.nombreArchivo, 'application/pdf'); // se visualiza en modal
              else{
                const nombre= response.data.fileName;
                this.dialogData.fileName=nombre;
                const ext= nombre.split('.')[1];
                downloadBase64(fileData, nombre,ext );
              }
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
            }
          },
          error:(e)=>{
            //console.error('Error al recibir el archivo', e);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
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
  }
  onVerDocumentoFile(file: File): void {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.nombre = file.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  } 
  onVerDocumentoBase64(fileBase64: string, nombre:string, mime:string): void {
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
  onEliminarIndex(index: number): void {
      this.listaDocumentos().splice(index, 1);
    } 
  eliminarDocumento(documento: archivos,tipoDocumento: number, index:number) {
  //tipoDocumento=2 que son archivos de exhortos enviados
    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarDocumento(documento,tipoDocumento,index),
      reject: () => { }
    });
  }
  
  onEliminarDocumento(documento: archivos, tipoDocumento: number,index:number) {
    //validamos si idArchivo no trae nada, quiere decir que son archivos nuevos que no se han guardado y se 
    //eliminan solo en el array, sin llamar la api
    if(documento.idArchivo == 0)
    {
      this.onEliminarIndex(index);
    }
    else{
      // Llamada al servicio para eliminar el documento
      this.exhortosService.eliminarArchivo(documento.idArchivo, tipoDocumento).subscribe({
        next: (response:any )=> {
          //console.log('¿Se eliminó archivo?:', response);
          //console.log('ID archivo:', idArchivo);
          //console.log('Tipo documento:', tipoDocumento);
          if (response.success) {
            // Encuentra el índice del documento que quieres eliminar
            const index = this.listaDocumentos().findIndex(doc => doc.idArchivo === documento.idArchivo);
            if (index !== -1) {
              // Elimina el elemento del arreglo
              this.listaDocumentos().splice(index, 1);
              this.cd.detectChanges(); // Asegura que la vista se actualice después de modificar el arreglo
            }
            //console.log("Documento eliminado");
            this.messageService.add({ severity: 'success', summary: 'Error', detail: 'Documento eliminado' });
          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
          }
        },
        error:(error) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        },
        complete:()=>{
          //this.idArchivo=null;
        }
      });
    }
    //this.confirmacionEliminarDocumento = false
  }
  async iniciarFirmaDocumentos() {
    this.isLoading = true;
    if (this.formularioFirma.valid) {
      const esvalido = await this.validarContraseñaPFX(this.formularioFirma.value.password as string);
      if (esvalido) {
        //if(this.archivo_pfx_valido){
        var userData = this.tokenService.getUserFromToken();
        const seleccionado = this.listaDocumentos().filter(item => item.selecParaFirma);
        if (seleccionado.length > 0) {
          for (let i = 0; i < seleccionado.length; i++) {
            seleccionado[i].idArchivo;
            //this.FirmarDocumentos(seleccionado[i].idArchivo);
            await this.FirmarDocumentos(userData.idGeneral, seleccionado[i].idArchivo, 2, this.formularioFirma.value.password as string);
          }
          this.seleccionadosParaFirma.set(false); //apagamos la señal para ocultar el boton firmar
          this.verRespuestaExhortoRecibido(this.idExhortoRecibido);
          //this.modalService.close('modal1');
          this.firmaDialog = false;
        }
        else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Selecciona el o los archivos que deseas firmar.' });
        }

      }/*else{
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Archivo PFX invalido.' });
      }*/
    }
    else {
      ValidateForm.validateAllFormFields(this.formularioFirma);
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Ingrese la contraseña.' });
    }
    this.isLoading = false;
  }
  validarContraseñaPFX(password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      //validamos que la contraseña sea correcta
      //validaFirma(formData: FormData)
      var userData = this.tokenService.getUserFromToken();
      const validaFirmaRequest = {
        idUsuario: userData.idGeneral,
        password: password
      };

      //Validar contraseña PFX
      this.exhortosService.validaFirmaPFX(validaFirmaRequest).subscribe({
        next: (response: any) => {
          if (response.success) {
            //this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento firmado exitosamente' });
            resolve(true); //resolve cuando se requiere que el flujo continue

          } else {
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
            reject(false); //reject es cuando se desea sali del flujo, ya no requere que se continue.
            
          }
        },
        error: (e) => {
          //console.error('Error al guardar el documento Firmado en el NAS', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          reject(false);
        },
        complete: () => {

        }
      });
    });
  }
  //Nueva funcion para firmar documentos, solo se debe de guardar el id de documento que se va a firmar,
  // y el idGeneral del usuario que firma
  FirmarDocumentos(idUsuario: number, idArchivo: number, idClasificacionArchivo: number, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const guardaFirmaTmpRequest = {
        idUsuario: idUsuario,
        idArchivo: idArchivo,
        idClasificacionArchivo: idClasificacionArchivo,
        passwordFirma: password
      };
      //console.log(guardaFirmaTmpRequest);
      this.exhortosService.guardaFirmaTemporal(guardaFirmaTmpRequest).subscribe({
        next: (response: any) => {
          if (response.success) {

            this.messageService.add({ severity: 'success', summary: 'éxito', detail: 'Firma temporal aplicada' });
            resolve(true);
          }
          else {
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
            resolve(false);
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          reject(false);
        },
        complete: () => {

        }
      })

    })
  }
  openNewFirma(){
    this.firmaDialog = true;
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  hideDialogFirma() {
    this.firmaDialog = false;

  }
}
