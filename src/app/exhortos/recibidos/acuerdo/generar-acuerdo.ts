import { ChangeDetectorRef, Component, computed, inject, Signal, signal } from '@angular/core';
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
import { archivos, CONATRIB_ExhortosRecibidosArchivos, EnviadoRespuestaArchivosResponse, generales, guardaExhortoRespuesta, ListadoCatalogoTipoDiligenciado, ListadoCatalogoTipoDocumento, ListadoExhortosRecibidosI, promocionExhortos, respuestaExhorto, VerMovimientosResponse } from '../../interfaces/exhortos.model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { QrService} from '../../../shared/services/qr.service';
import ValidateForm from '../../../helpers/validateform';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { Button } from "primeng/button";
import { FileSelectEvent, FileUpload } from "primeng/fileupload";
import {TableModule, TableRowCollapseEvent, TableRowExpandEvent} from 'primeng/table';
import { base64ToFile, downloadBase64, downloadFile, validaPdf } from '../../../shared/functions/utils';
import {validarFirmasUsuario} from '../../functions/firmas';
import { DialogModule } from "primeng/dialog";
import { InputIconModule } from "primeng/inputicon";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { ModalComponent } from "../../../shared/components/modal-component/modal-component";
import { ModalService } from '../../../shared/services/modal.service';
import { ButtonModule } from 'primeng/button';

import { Send } from '@primeicons/angular/send';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-GenerarAcuerdo',
  imports: [ConfirmDialog,CheckboxModule,ButtonModule, Spinner, CommonModule, FormsModule, ReactiveFormsModule, SelectModule, TextareaModule, PdfDialog, Button, FileUpload, TableModule, DialogModule, InputIconModule, ConfirmDialogModule, ToastModule, InputTextModule, ModalComponent, Send],
  templateUrl: './generar-acuerdo.html',
  styleUrl: './generar-acuerdo.css',
  providers: [MessageService,ConfirmationService],
  

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
  movimientos = signal<VerMovimientosResponse[]>([]);
  tienePermisoEliminarFirma = signal<boolean>(false);
  tienePermisoAplicarFirma = signal<boolean>(false);
  tienePermisoTurnar = signal<boolean>(false);

  listadoTipoDiligenciado = signal<ListadoCatalogoTipoDiligenciado[]>([]);
  listadoTipoDocumento = signal<ListadoCatalogoTipoDocumento[]>([]);
  listaDocumentos=signal<archivos[]>([]);
  datosExhortoRecibido: ListadoExhortosRecibidosI | null = null;
  acuseEnviarAcuerdoArchivos! : EnviadoRespuestaArchivosResponse;
  detallesAcuerdo =signal<respuestaExhorto>(<respuestaExhorto>{});
  //true cuando el documento de tipo acuerdo ya tiene las dos firmas (secretario y juez); solo aplica cuando
  //el exhorto pasa por el juez, no se usa para habilitar Enviar generales (ver puedeEnviarGenerales)
  tieneDosFirmas = signal<boolean>(false);
  //existe al menos un documento tipo 1 (oficio); "activo" no sirve como filtro aqui, el backend lo regresa
  //en false incluso para documentos vigentes (p.ej. el tipo 2 ya firmado), asi que solo se valida el tipo
  existeDocumentoTipo1 = computed(() => this.listaDocumentos().some(a => a.idTipoDocumento === 1));
  //el documento tipo 2 (acuerdo) ya esta firmado; no se exige un numero fijo de firmantes porque no todos
  //los exhortos pasan por el juez (p.ej. el flujo Secretario->Notificador->Secretario solo lleva su firma)
  existeDocumentoTipo2Firmado = computed(() => this.listaDocumentos().some(a => a.idTipoDocumento === 2 && a.firmado === true));
  //el documento tipo 1 (el que carga el notificador) ya tiene las firmas aplicadas
  existeDocumentoTipo1Firmado = computed(() => this.listaDocumentos().some(a => a.idTipoDocumento === 1 && a.firmado === true));
  //el secretario ya recibio de vuelta lo que le turno el notificador (ultimo movimiento Notificador -> Secretario,
  //ya recibido). Antes de eso el secretario no puede enviar generales, aunque los documentos ya esten listos
  secretarioYaRecibioDeNotificador = computed(() => {
    const lista = this.movimientos();
    if (!lista || lista.length === 0) {
      return false;
    }
    const ultimoMovimiento = lista[lista.length - 1];
    const vieneDeNotificador = ultimoMovimiento.cargoOrigen?.trim() === 'Notificador';
    const vaASecretario = ultimoMovimiento.cargoDestino?.trim() === 'Secretario';
    const estaRecibido = ultimoMovimiento.fechaRecepcion !== null;
    return vieneDeNotificador && vaASecretario && estaRecibido;
  });
  //Enviar generales requiere al menos un documento tipo 1 (oficio), el tipo 2 (acuerdo) ya firmado, y que
  //el secretario ya haya recibido de vuelta lo que le turno el notificador
  puedeEnviarGenerales = computed(() =>
    this.existeDocumentoTipo1() && this.existeDocumentoTipo2Firmado() && this.secretarioYaRecibioDeNotificador()
  );

  //true desde que el secretario turno el acuerdo al juez (idMovimiento 9) en adelante; oculta Guardar y eliminar archivo
  yaTurnadoAJuez = computed(() => {
    const lista = this.movimientos();
    if (!lista || lista.length === 0) {
      return false;
    }
    const maxId = Math.max(...lista.map(m => m.idMovimiento));
    return maxId >= 9;
  });
  //true cuando el perfil actualmente seleccionado es Notificador
  esNotificador = computed(() => this.tokenService.getPerfilNombre() === 'Notificador');
  //true cuando el perfil actualmente seleccionado es Secretario; solo el secretario puede enviar generales
  esSecretario = computed(() => this.tokenService.getPerfilNombre() === 'Secretario');
  //solo secretario (mientras no haya turnado al juez, idMovimiento 9) y notificador (mientras no haya turnado de
  //vuelta al secretario, idMovimiento 12, y solo una vez que ya recibio su turno) pueden cargar documentos
  puedeCargarDocumento = computed(() => {
    const perfil = this.tokenService.getPerfilNombre();
    const lista = this.movimientos();
    const maxId = lista && lista.length > 0 ? Math.max(...lista.map(m => m.idMovimiento)) : 0;
    if (perfil === 'Secretario') {
      return maxId < 9;
    }
    if (perfil === 'Notificador') {
      if (maxId >= 12) {
        return false;
      }
      //antes de recibir su turno el notificador no puede cargar documentos
      const ultimoMovimiento = lista.length > 0 ? lista[lista.length - 1] : null;
      const esDestinatario = ultimoMovimiento?.cargoDestino?.trim() === perfil?.trim();
      const estaRecibido = ultimoMovimiento?.fechaRecepcion !== null && ultimoMovimiento?.fechaRecepcion !== undefined;
      return esDestinatario && estaRecibido;
    }
    return false;
  });
  //el juez ya firmo el archivo tipo 2 (acuerdo); igual que "yaFirmoEnTipo2" en detalles-exhorto-recibido
  yaFirmoTipo2ComoJuez = computed(() => {
    const userData = this.tokenService.getUserFromToken();
    const idUsuario = userData !== null ? userData.idGeneral : 0;
    return this.listaDocumentos().some(a =>
      a.idTipoDocumento === 2 &&
      a.firmantes?.some(f => f.idUsuario === idUsuario)
    );
  });
  //puedeTurnar cubre cuatro casos, igual que en detalles-exhorto-recibido:
  //- Juez en idMovimiento 9: solo puede turnar una vez que el ya firmo el archivo tipo 2 (acuerdo)
  //- Notificador: solo puede turnar de vuelta al secretario una vez que ya cargo un documento tipo 1
  //  (distinto del tipo 2/acuerdo)
  //- Secretario, cuando el ultimo movimiento viene del notificador: solo puede turnar una vez que ese
  //  archivo tipo 1 ya tenga las firmas aplicadas.
  //- Secretario, cuando el ultimo movimiento viene del juez: solo puede turnar una vez que el archivo
  //  tipo 2 (acuerdo) ya tenga las firmas aplicadas (no solo seleccionadas como firmante, sino ya
  //  "aplicadas" al PDF final)
  //Estos dos ultimos casos no usan un idMovimiento fijo (a diferencia del caso del Juez) porque el numero
  //de movimiento varia segun cuantos pasos previos tuvo cada exhorto (p.ej. si paso o no por el juez);
  //lo estable es el origen/destino del ultimo movimiento.
  puedeTurnar = computed(() => {
    const perfil = this.tokenService.getPerfilNombre();
    const lista = this.movimientos();
    if (!lista || lista.length === 0) {
      return false;
    }
    const ultimoMovimiento = lista[lista.length - 1];
    const esDestinatario = ultimoMovimiento.cargoDestino?.trim() === perfil?.trim();
    const estaRecibido = ultimoMovimiento.fechaRecepcion !== null;
    if (perfil === 'Juez' && ultimoMovimiento.idMovimiento === 9) {
      return esDestinatario && estaRecibido && this.yaFirmoTipo2ComoJuez();
    }
    if (perfil === 'Notificador') {
      return esDestinatario && estaRecibido && this.existeDocumentoTipo1();
    }
    if (perfil === 'Secretario' && ultimoMovimiento.cargoOrigen?.trim() === 'Notificador') {
      return esDestinatario && estaRecibido && this.existeDocumentoTipo1Firmado();
    }
    if (perfil === 'Secretario' && ultimoMovimiento.cargoOrigen?.trim() === 'Juez') {
      return esDestinatario && estaRecibido && this.existeDocumentoTipo2Firmado();
    }
    return false;
  });
  //idMovimiento del ultimo movimiento registrado, igual que en detalles-exhorto-recibido
  ultimoMovimiento = computed<number | null>(() => {
    const lista = this.movimientos();
    return lista && lista.length > 0 ? lista[lista.length - 1].idMovimiento : null;
  });
  //una vez que el notificador ya turno de vuelta al secretario (idMovimiento 12) ya nadie puede seleccionar
  //documentos para firmar en esta pantalla; no depende del perfil de quien esta viendo, sino de que ese
  //movimiento ya haya ocurrido
  notificadorYaTurno = computed(() => {
    const lista = this.movimientos();
    const maxId = lista && lista.length > 0 ? Math.max(...lista.map(m => m.idMovimiento)) : 0;
    return maxId >= 12;
  });
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
  idPantalla=10;
  isLoading: boolean = false;
  firmaDialog: boolean=false;
   dialogData: any = {}; // Para almacenar la información del archivo del diálogo

  uploadedFiles: any[] = [];
  nombreDocumento: string = '';
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  seleccionadosParaFirma = signal(false);

  promociones!: promocionExhortos[];
    expandedRows = {};
  filaExpandidaId: number | null = null;
  

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
    public modalService : ModalService,
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
      this.getPromocionExhorto(this.idExhortoRecibido);

      this.GetSeccionesUsuario();
      this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());
      this.obtenerMovimientos(this.idExhortoRecibido);
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
            this.messageService.add({ severity: 'error', summary: 'Error', detail: responseTipoDiligenciado.message, sticky: true });
          }
        },
        error:(e) => {
          //console.error('Error al cargar los tipos de diligenciado', e.message);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
          this.messageService.add({ severity: 'error', summary: 'Error', detail: responseTipoDocumento.message, sticky: true });
        }
      },
      error:(e) => {
        //console.log("Error al cargar los tipos de documentos", e.message);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${ response.errors==undefined ? "" : response.errors.join(", ")}`, sticky: true });
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
              this.tieneDosFirmas.set(tieneDosFirmas);

            } else {
              this.tieneDosFirmas.set(false);
              this.listaDocumentos.set([]);
              this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontraron documentos asociados al exhorto.'
              });
            }
          } else {
            //console.warn('La respuesta no contiene datos.');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La respuesta no contiene datos.', life:10000 });
          }
        } else {
          //console.warn('La respuesta fue incorrecta');
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message, sticky: true });
        }
      },
      error:(e) => {
        //console.error('Error al cargar respuesta de exhorto', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
            this.idRespuesta=Number(response.data.idRespuesta);
            //this.acuerdo=response.data;
            this.detallesAcuerdo().generales = response.data;
            //asignamos los valores devueltos al formulario
            this.acuerdosForm.patchValue({
              tipoDiligenciado: this.listadoTipoDiligenciado().find(item => item.idTipoDiligenciado === this.detallesAcuerdo().generales.idTipoDiligenciado) || null,
              observaciones: this.detallesAcuerdo().generales.observaciones || ''
            });
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Respuesta guardada.' });
            this.cd.detectChanges();
          }else{
            //console.log("No se pudo guardar la respuesta.", response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors[0] , sticky: true});
          }

        },
        error:(e) => {
            //console.error('Error en la petición guardar:', e.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
          this.messageService.add({severity:'error',summary: 'Error', detail:`${response.message}\n${ response.errors == undefined ? "": response.errors.join(", ")}`, sticky: true});
        }

      },
      error:(e)=>{
        //console.error('Error al recibir el archivo', e);
        this.messageService.add({severity:'error',summary: 'Error', detail:e.message, sticky: true});
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
            this.modalService.open('modal2');
          // Aquí podrías actualizar la lista de documentos si es necesario
        }
        else{
          this.messageService.add({severity:'error',summary: 'Error', detail:`${response.message}\n${ response.errors == undefined ? "": response.errors.join(", ")}`, sticky: true});
        }

        //this.cargarDetallesAcuerdo(idExhortoRecibido);
        this.verRespuestaExhortoRecibido(idExhortoRecibido);

      },
      error:(e)=>{
        //console.error('Error al recibir el archivo', e);
        this.messageService.add({severity:'error',summary: 'Error', detail:e.message, sticky: true});
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
                this.tienePermisoEliminarFirma.set(false);
                this.tienePermisoAplicarFirma.set(false);
                this.tienePermisoTurnar.set(false);

              }
              else if (this.secciones.length > 0) {
                this.tienePermisoGuardar.set(this.secciones.some(s => s.descripcion === 'Guardar'));
                this.tienePermisoEnviarGenerales.set(this.secciones.some(s => s.descripcion === 'EnviarGenerales'));
                this.tienePermisoEnviarArchvios.set(this.secciones.some(s => s.descripcion === 'EnviarArchivos'));
                this.tienePermisoSeleccionarArchivo.set(this.secciones.some(s => s.descripcion === 'SeleccionarArchivo'));
                this.tienePermisoCargarArchivo.set(this.secciones.some(s => s.descripcion === 'CargarArchivo'));
                this.tienePermisoFirmarArchivo.set(this.secciones.some(s => s.descripcion === 'FirmarArchivo'));
                this.tienePermisoEliminarArchivo.set(this.secciones.some(s => s.descripcion === 'EliminarArchivo'));
                this.tienePermisoEliminarFirma.set(this.secciones.some(s => s.nombre === 'EliminarFirma'));
                this.tienePermisoAplicarFirma.set(this.secciones.some(s => s.nombre === 'AplicarFirma'));
                this.tienePermisoTurnar.set(this.secciones.some(s => s.nombre === 'Turnar'));
              }
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error en la respuesta del servidor.", sticky: true });
            }
            
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, sticky: true });
            
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
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message, sticky: true });
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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo documento requerido', life:10000 });
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
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
          this.nombreDocumento = ''; // Restablece el nombre del documento en caso de error
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el documento', sticky: true });
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
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` , sticky: true});
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message, sticky: true });
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
              this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error, sticky: true });
            }
          },
          error:(e)=>{
            //console.error('Error al recibir el archivo', e);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: 'Documento eliminado' });
          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true });
          }
        },
        error:(error) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
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
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Selecciona el o los archivos que deseas firmar.', sticky: true });
        }

      }/*else{
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Archivo PFX invalido.' });
      }*/
    }
    else {
      ValidateForm.validateAllFormFields(this.formularioFirma);
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Ingrese la contraseña.', sticky: true });
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
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
            reject(false); //reject es cuando se desea sali del flujo, ya no requere que se continue.
            
          }
        },
        error: (e) => {
          //console.error('Error al guardar el documento Firmado en el NAS', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
            resolve(false);
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
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
  obtenerMovimientos(idExhortoRecibido: number) {
    this.exhortosService.getMovimientos(idExhortoRecibido).subscribe({
        next:(response => {
            //console.log('Datos recibidos:', response);
            this.movimientos.set(response.data); // Almacena los datos recibidos en la variable
           
          }),
        error:(error) => {
            //console.error('Error al cargar los movimientos del exhorto', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
        }
    });
  }
  //Turnar el exhorto (misma logica/servicio que en detalles-exhorto-recibido): el notificador la usa para
  //regresarlo al secretario una vez que ya cargo el documento tipo 1
  turnar() {
    this.confirmationService.confirm({
      key: 'turnarExhorto',
      accept: () => this.onTurnar(),
      reject: () => { }
    });
  }
  onTurnar() {
    if (this.idExhortoRecibido !== undefined) {
      const idE = this.idExhortoRecibido;
      const perfil = this.authService.getRoleNameUsuario();
      this.isLoading = true;
      this.cd.detectChanges();
      this.exhortosService.Turnar(this.idExhortoRecibido, perfil).subscribe({
        next: (response => {
          if (response.success) {
            if (response.data.resultado) {
              this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg, icon: 'pi pi-check-circle' });
              this.obtenerMovimientos(idE);
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Ok', detail: response.data.msg });
            }
          }
        }),
        error: (err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, sticky: true });
          this.isLoading = false;
          this.cd.detectChanges();
        }),
        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    }
  }
  modalClosed(id: number) {
    //cuando se cierra la modal de confirmacion de envio de archivos, redireccionamos a la busqueda principal
    //console.log(id)
    this.router.navigate(['/exhortos/lista-exhortos-recibidos'], { state: { id } });
  }
  printDivContent(): void {
    window.print();
  }

  getPromocionExhorto(idExhorto:number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.getPromocionExhorto(idExhorto).subscribe({
        next: (responsePromociones => {
          if(responsePromociones.success){

            //this.detallesAcuerdo = response.data;
            if(responsePromociones.data.length>0){
                this.promociones = responsePromociones.data;
                //this.bandPromo = true;
            }
          }
          else{
            //console.log(responsePromociones.errors);
            //this.bandPromo = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: responsePromociones.message +'\n'+ responsePromociones.errors, sticky: true });
          }
        }),
        error: (error) => {
          //console.error('Error al cargar detalle de promoción', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
          this.isLoading=false;
          this.cd.detectChanges();
        },
        complete:()=>{
          this.isLoading=false;
          this.cd.detectChanges();
        }
      });
  }

  onRowExpand(event: TableRowExpandEvent) {
        this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
    }

    onRowCollapse(event: TableRowCollapseEvent) {
        this.messageService.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
    }
    

  toggleFilaExpandida(id: number) {
    this.filaExpandidaId = this.filaExpandidaId === id ? null : id;
  }

  //Llamada al servicio para obtener los Archivos base64 pdf
  mostrarArchivo(documento: CONATRIB_ExhortosRecibidosArchivos, tipoDocumento: number): void {
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
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message, sticky: true });
        //const nombre= response.data.fileName;
        //const ext= nombre.split('.')[1];

        //downloadBase64(base64String, nombre,ext );
        //this.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64String}`);
        //this.visible = true;
      },
      error: (error) => {
        //console.error('Error al recibir el archivo', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
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
        this.cd.detectChanges();
      } else {
        console.error('Documento inválido');
    } 
  }


}



